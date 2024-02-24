import serial
import random
import platform
import struct
import threading
import time
import io
import PIL.Image as Image

from PIL import UnidentifiedImageError  # Import the exception class
from commonRadio import calculate_checksum

ongoing_responses_lock = threading.Lock()

# Command mapping to operation codes and expected parameter count
COMMAND_MAPPING = {
    # System Check Commands
    "SystemStatus": {"op_code": 0x1003, "type": 0x00, "param_count": 0},
    "Housekeeping": {"op_code": 0x1003, "type": 0x01, "param_count": 0},
    "HousekeepingRepeat": {"op_code": 0x1003, "type": 0x01, "param_count": 0},
    "MemoryCheck": {"op_code": 0x1003, "type": 0x02, "param_count": 2},
    "BatteryStatus": {"op_code": 0x1003, "type": 0x03, "param_count": 0},
    "MemoryStatus": {"op_code": 0x1003, "type": 0x04, "param_count": 0},
    # Communication Commands
    "BeaconActivate": {"op_code": 0x1003, "type": 0x10, "param_count": 0},
    "BeaconDeactivate": {"op_code": 0x1003, "type": 0x11, "param_count": 0},
    "SendBeaconStatus": {"op_code": 0x1003, "type": 0x11, "param_count": 0},
    # Data Handling Commands
    "RequestFiles": {"op_code": 0x1003, "type": 0x20, "param_count": 2},
    "SendFile": {"op_code": 0x1003, "type": 0x21, "param_count": 2},
    "DeleteFile": {"op_code": 0x1003, "type": 0x22, "param_count": 1},
    # Imaging Commands
    "TakePhoto": {"op_code": 0x1003, "type": 0x30, "param_count": 2},
    "SchedulePhoto": {"op_code": 0x1003, "type": 0x31, "param_count": 2},
    "PhotoStatus": {"op_code": 0x1003, "type": 0x32, "param_count": 0},
    # Payload Management Commands
    "ActivatePayload": {"op_code": 0x1003, "type": 0x40, "param_count": 1},
    "DeactivatePayload": {"op_code": 0x1003, "type": 0x41, "param_count": 1},
    "PayloadStatus": {"op_code": 0x1003, "type": 0x42, "param_count": 0},
    # Reprogramming Commands
    "ReprogramAbacus": {"op_code": 0x1003, "type": 0x50, "param_count": 1},
    "UpdateSoftware": {"op_code": 0x1003, "type": 0x51, "param_count": 2},
    # Diagnostic and Debugging Commands
    "RunDiagnostics": {"op_code": 0x1003, "type": 0x60, "param_count": 1},
    "ErrorLogRequest": {"op_code": 0x1003, "type": 0x61, "param_count": 2},
    "ResetSystem": {"op_code": 0x1003, "type": 0x62, "param_count": 1},
    # Dummy Commands
    "DummyCommand0": {"op_code": 0x1003, "type": 0x70, "param_count": 0},
    "DummyCommand1": {"op_code": 0x1003, "type": 0x71, "param_count": 0},
    # Specific Mission Commands
    "CustomCommand0": {"op_code": 0x1003, "type": 0x80, "param_count": 0},
    "ExperimentalFeature": {"op_code": 0x1003, "type": 0x81, "param_count": 2},
    # Power Management Commands
    "PowerDown": {"op_code": 0x1003, "type": 0x90, "param_count": 2},
    "PowerUp": {"op_code": 0x1003, "type": 0x91, "param_count": 1},
    # Orientation and Movement Commands
    "AdjustOrientation": {"op_code": 0x1003, "type": 0xA0, "param_count": 2},
    "MoveToCoordinates": {"op_code": 0x1003, "type": 0xA1, "param_count": 2},
    # Emergency Commands
    "EmergencyShutdown": {"op_code": 0x1003, "type": 0xB0, "param_count": 0},
    "SafeMode": {"op_code": 0x1003, "type": 0xB1, "param_count": 2},
    # Packet Commands
    "RequestPackets": {"op_code": 0x1003, "type": 0xFF, "param_count": 2}, 
    "AcknowledgePackets": {"op_code": 0x1003, "type": 0xFA, "param_count": 1},
}

class MultiPacketResponse:
    def __init__(self, timeout = 5):
        self.total_packets = None  # Track the total number of packets excluding the termination packet
        self.received_packets = 0
        self.expected_packet_number = 0
        self.data = {}  # Store packet data indexed by packet number
        self.missing_packets = []
        self.message_complete = False  # Flag for message completion
        self.timeout = timeout  # Timeout in seconds
        self.timer = None  # Timer to handle timeout
        self.command_type = None  # Store the command type for missing packet requests

    def reset_timeout(self):
        if self.timer:
            self.timer.cancel()
        self.timer = threading.Timer(self.timeout, self.handle_timeout)
        self.timer.start()

    def handle_timeout(self):
        # Timeout handling code
        with ongoing_responses_lock:
            if not self.message_complete and self.data:
                # Assume message completion if no packets have been received for `self.timeout` seconds
                self.message_complete = True
                complete, missing_packets = self.is_complete()
                if complete:
                    # Handle missing packets or conclude reception
                    print(f"Timeout reached. Handling message completion for command type. Missing packets: {missing_packets}")
                    if missing_packets:
                        request_missing_packets(missing_packets, self.command_type)
                    else:
                        acknowledge_all_packets(self.command_type)
                        message_data = self.reconstruct_data()
                        # Further processing, such as showing an image or decoding a message
                        if self.command_type == 48:  # Example for image
                            try:
                                image = Image.open(io.BytesIO(message_data))
                                image.show()
                            except UnidentifiedImageError:
                                print("Received data is not a valid image\n")
                        else:  # Example for text message
                            try:
                                message_string = message_data.decode()
                                print(f"Received message: {message_string}\n")
                            except UnicodeDecodeError:
                                pass
                            self.timer = None  # Reset timer
                        del ongoing_responses[self.command_type]  # Clean up after processing

    def add_packet(self, packet_data, packet_number):
        if packet_number == 0xFFFF:
            self.message_complete = True  # Mark message as complete upon receiving termination packet
            # Do not include the termination packet in the total packet count or data dictionary
            return

        # Store packet data by packet number for valid packets
        self.data[packet_number] = packet_data
        self.received_packets += 1

        # Detect missing packets
        while self.expected_packet_number in self.data or self.expected_packet_number < packet_number:
            self.expected_packet_number += 1
        if packet_number < self.expected_packet_number - 1:
            self.missing_packets.extend(range(packet_number + 1, self.expected_packet_number))

        if packet_number in self.missing_packets:
            self.missing_packets.remove(packet_number)

        self.reset_timeout()

    def is_complete(self):
        # Determine if message is complete
        if self.message_complete and self.data:
            # Calculate total packets based on the highest packet number received
            self.total_packets = max(self.data.keys()) + 1
            # Update missing packets list based on total_packets and received packets
            all_expected_packets = set(range(self.total_packets))
            received_packets = set(self.data.keys())
            self.missing_packets = list(all_expected_packets - received_packets)
            return True, self.missing_packets
        elif not self.data:
            self.missing_packets = [0]
            return True, self.missing_packets
        else:
            return False, self.missing_packets

    def reconstruct_data(self):
        # Sort and concatenate packet data to reconstruct the original data stream
        ordered_packets = [self.data[packet_number] for packet_number in sorted(self.data.keys())]
        return b''.join(ordered_packets)

def request_missing_packets(missing_packets, command_type):

    for packet_number in missing_packets:
        print(f"Requesting re-transmission for missing packet: {packet_number}")

    command_byte = command_type.to_bytes(1, byteorder = 'big')

    missing_packets.insert(0, command_byte)

    COMMAND_MAPPING["RequestPackets"]["param_count"] = len(missing_packets)

    send_command("RequestPackets", missing_packets)

def acknowledge_all_packets(command_type):

    send_command("AcknowledgePackets", [command_type.to_bytes(1, byteorder = 'big')])

def find_command_by_type(search_type):
    # Initialize an empty list to store matching command keys
    matching_commands = ''
    # Iterate through each key-value pair in the COMMAND_MAPPING dictionary
    for command, attributes in COMMAND_MAPPING.items():
        # Check if the current subdictionary's type matches the search_type
        if attributes['type'] == search_type:
            # If it matches, append the command key to the matching_commands list
            matching_commands = command
            break
    # Return the list of matching commands
    return matching_commands

# Use a dictionary to track ongoing multi-packet responses by op_code
ongoing_responses = {}

class RadioOperation:
    def __init__(self, op_code, name, args, total_bytes, summary, return_code = 0):
        self.op_code = op_code
        self.name = name
        self.args = args
        self.total_bytes = total_bytes
        self.summary = summary
        self.return_code = return_code

default_transmit_operations_dict = {
    0x1001 : RadioOperation(0x1001, "No-Op", [], 0, "No-op command. Increments command processing counter.", 0x2001),
    0x1002 : RadioOperation(0x1002, "Reset", [], 0, "Reset radio processors and systems.", 0x2002),
    0x1005 : RadioOperation(0x1005, "Get Transceiver Configuration", [], 0, "Read radio configuration.", 0x2005),
    0x1007 : RadioOperation(0x1007, "Telemetry", [], 0, "Query a telemetry frame.", 0x2007),
    0x1012 : RadioOperation(0x1012, "Read Firmware Rev", [], 0, "Read radio firmware revision.", 0x2012),
}

acknowledgment_operations_dict = {
    0x2001 : RadioOperation(0x2001, "No-Op Ack", [], 0, "No-op Acknowledge."),
    0x2002 : RadioOperation(0x2002, "Reset Ack", [], 0, "Reset acknowledge."),
    0x2003 : RadioOperation(0x2003, "Transmit Ack", [], 0, "Transmit acknowledge."),
    0x2004 : RadioOperation(0x2004, "Received Data", [], 0, "Received n number of bytes AX.25 packet."),
    0x2005 : RadioOperation(0x2005, "Transceiver Configuration", [], 0, "Radio configuration structure."),
    0x2006 : RadioOperation(0x2006, "Set Transceiver Configuration Ack", [], 0, "Set radio configuration Acknowledge."),
    0x2007 : RadioOperation(0x2007, "Telemetry", [], 0, "Telemetry frame."),
    0x2008 : RadioOperation(0x2008, "Write Flash Ack", [], 0, "Write Flash Acknowledge."),
    0x2009 : RadioOperation(0x2009, "RF Configure Ack", [], 0, "RF Configuration Acknowledge."),
    0x2010 : RadioOperation(0x2010, "Beacon Data Ack", [], 0, "Ack Set Beacon Contents."),
    0x2011 : RadioOperation(0x2011, "Beacon Conf. Ack", [], 0, "Ack Beacon Configuration."),
    0x2012 : RadioOperation(0x2012, "Firmware Rev", [], 4, "Firmware number, float 4 byte."),
    0x2013 : RadioOperation(0x2013, "DIO Key Write Ack", [], 0, "Ack DIO Key Write."),
    0x2014 : RadioOperation(0x2014, "Firmware Update Ack", [], 0, "Firmware Update Ack."),
    0x2015 : RadioOperation(0x2015, "Firmware Packet Ack", [], 0, "Firmware Packet Ack."),
    0x2020 : RadioOperation(0x2020, "Fast Set PA Ack", [], 0, "Power Amplifier Set Ack"),
}

# Add transmitted and received
custom_operations_dict = {
    0x1003 : RadioOperation(0x1003, "Transmit", [], 0, "Send n number of bytes to radio board.", 0x2003),
    0x1006 : RadioOperation(0x1006, "Set Transceiver Configuration", [], 0, "Set radio configuration.", 0x2006),
    0x1008 : RadioOperation(0x1008, "Write Flash", [], 16, "Write Flash with MD5 Checksum.", 0x2008),
    0x1009 : RadioOperation(0x1009, "RF Configure", [], 0, "Low Level RF Configuration.", 0x2009),
    0x1010 : RadioOperation(0x1010, "Beacon Data", [], 0, "Set beacon Contents.", 0x2010),
    0x1011 : RadioOperation(0x1011, "Beacon Configure", [], 0, "Set beacon configuration.", 0x2011),
    0x1013 : RadioOperation(0x1013, "DIO Key Write", [], 16, "DIO Key Write.", 0x2013),
    0x1014 : RadioOperation(0x1014, "Firmware Update", [], 16, "Firmware Update Command.", 0x2014),
    0x1015 : RadioOperation(0x1015, "Firmware Packet", [], 0, "Firmware Packet Write.", 0x2015),
    0x1020 : RadioOperation(0x1020, "Fast Set PA", [], 1, "Power Amplifier Level Set High Speed", 0x2020),
}

def serial_read_thread():
    while True:
        if ser.in_waiting > 0:  # Check if data is available
            incoming_data = ser.read(ser.in_waiting)  # Read all available data
            check_response(incoming_data)
        time.sleep(0.1)  # Small delay to prevent CPU overload

def send_command(command_name, parameters = []):
    if command_name not in COMMAND_MAPPING:
        print("Unknown command.")
        return

    command_info = COMMAND_MAPPING[command_name]
    op_code = command_info["op_code"]
    packet_type = command_info["type"]
    param_count = command_info["param_count"]

    if len(parameters) != param_count:
        print(f"Invalid number of parameters for {command_name}. Expected {param_count}, got {len(parameters)}.")
        return

    data = b''

    for param in parameters:
        if isinstance(param, int):
            data_bytes = param.to_bytes(2, byteorder = 'big')
        elif isinstance(param, (bytes, bytearray)):
            data_bytes = param  # If it's already bytes, no conversion is needed
        elif isinstance(param, str):
            data_bytes = param.encode()
        else:
            data_bytes = ''.encode()
            raise ValueError("test_packet.data must be an integer, bytes, or bytearray")
        data += data_bytes
    
    command = RadioOperation(command_info['op_code'], command_name, data, len(data), f'{command_name} with params {parameters}', 0x2003)

    MAX_DATA_SIZE = 250
    sync_chars = 0x4865
    data_chunks = [command.args[i:i+MAX_DATA_SIZE] for i in range(0, len(command.args), MAX_DATA_SIZE)]

    if not data_chunks:
        packet_bytes = struct.pack('HHH', sync_chars, 0x1003, 5)  # 5 as this is the number of structured bytes
        header_check_sum_A, header_check_sum_B = calculate_checksum(packet_bytes)
        payload_header_packet = struct.pack('!HHHBB', sync_chars, 0x1003, 5, header_check_sum_A, header_check_sum_B)

        data_header_bytes = struct.pack('!BH', packet_type, 0x0000)
        data_check_sum_A, data_check_sum_B = calculate_checksum(data_header_bytes)
        data_packet = data_header_bytes + struct.pack('!BB', data_check_sum_A, data_check_sum_B)
        payload_check_sum_A, payload_check_sum_B = calculate_checksum(payload_header_packet + data_packet)

        packet = payload_header_packet + data_packet + struct.pack('!BB', payload_check_sum_A, payload_check_sum_B)
        send_packet(packet)
        return

    for packet_num, chunk in enumerate(data_chunks):
        # Prepare each chunk as a separate packet
        packet_length = len(chunk)
        packet_bytes = struct.pack('HHH', sync_chars, 0x1003, packet_length + 5) 
        header_check_sum_A, header_check_sum_B = calculate_checksum(packet_bytes)
        payload_header_packet = struct.pack('!HHHBB', sync_chars, 0x1003, packet_length + 5, header_check_sum_A, header_check_sum_B)

        data_header_bytes = struct.pack('!BH', packet_type, packet_num)
        data_check_sum_A, data_check_sum_B = calculate_checksum(data_header_bytes + chunk)
        data_packet = data_header_bytes + chunk + struct.pack('!BB', data_check_sum_A, data_check_sum_B)
        payload_check_sum_A, payload_check_sum_B = calculate_checksum(payload_header_packet + data_packet)

        packet = payload_header_packet + data_packet + struct.pack('!BB', payload_check_sum_A, payload_check_sum_B)

        send_packet(packet, packet_num)

def send_packet(packet, packet_num = 0):
    time.sleep(0.2)
    ser.write(packet)
    print(f"Sent packet number: {packet_num} with length: {len(packet)} bytes")
    
def check_response(data):
    with ongoing_responses_lock:
        HEADER_SIZE = 8  # Example fixed header size
        PACKET_SIZE = 5
        if len(data) < HEADER_SIZE:
            print("Received packet is too short")
            return

        # Extract operation code and length from the header
        sync_chars = struct.unpack('!H', data[0:2])[0]
        op_code = struct.unpack('!H', data[2:4])[0]
        response_length = struct.unpack('!H', data[4:6])[0]
        received_header_check_sum_A, received_header_check_sum_B = struct.unpack('!BB', data[6:8])

        received_header_bytes = struct.pack('HHH', sync_chars, op_code, response_length)
        header_check_sum_A, header_check_sum_B = calculate_checksum(received_header_bytes)

        if header_check_sum_A != received_header_check_sum_A or header_check_sum_B != received_header_check_sum_B:
            print("Header checksums do not match")
            print(f"Received: {received_header_check_sum_A}, {received_header_check_sum_B} | Expected: {header_check_sum_A}, {header_check_sum_B}")
            return

        #print(f"\nReceived packet with op_code: {op_code} and length: {response_length} bytes\n")
        #for byte in data[0:HEADER_SIZE]:
        #    print(f'{byte:02X}', end='')

        # Compare the received data with the expected messages
        if len(data) == HEADER_SIZE:
            if response_length == 0x0A0A:
                print("\nCommand received successfully\n")
            elif response_length == 0xFFFF:
                print("\nCommand not received\n")
            else:
                print("\nUnexpected response from command\n")
            return
        if len(data) < HEADER_SIZE + PACKET_SIZE:
            print("\nResponse length does not match the expected length\n") 
            return

        # Assuming packet number and total packets are in the data, adjust indices as needed
        command_type, packet_number = struct.unpack('!BH', data[HEADER_SIZE:HEADER_SIZE+3])

        if command_type == 0xFF or command_type == 0xFA:
            return

        # Check if this packet belongs to an ongoing operation
        if command_type not in ongoing_responses:
            ongoing_responses[command_type] = MultiPacketResponse()

        ongoing_response = ongoing_responses[command_type]
        ongoing_response.command_type = command_type
        ongoing_response.add_packet(data[HEADER_SIZE+3:-4], packet_number)

        complete, missing_packets = ongoing_response.is_complete()
        if complete:
            if missing_packets:
                ongoing_response.message_complete = False
                request_missing_packets(missing_packets, command_type)
                return
            else:
                acknowledge_all_packets(command_type)
            print(f"Complete message received for command type {command_type} consists of {ongoing_response.received_packets} packets\n")
            message_data = ongoing_response.reconstruct_data()
            # Further processing, such as showing an image or decoding a message
            if command_type == 48:  # Example for image
                try:
                    image = Image.open(io.BytesIO(message_data))
                    image.show()
                except UnidentifiedImageError:
                    print("Received data is not a valid image\n")
            else:  # Example for text message
                try:
                    message_string = message_data.decode()
                    print(f"Received message: {message_string}\n")
                except UnicodeDecodeError:
                    pass
            del ongoing_responses[command_type]  # Clean up after processing

def send_housekeeping():
    """
    This function sends the 'Housekeeping' command every 10 seconds.
    """
    send_command("Housekeeping")
    # Schedule the next 'Housekeeping' command after 10 seconds
    threading.Timer(10.0, send_housekeeping).start()

def user_command():
    user_input = input("")  # e.g., "ActivatePayload 1"
    input_parts = user_input.split()
    if input_parts:
        command_name = input_parts[0]
        parameters = input_parts[1:]

        send_command(command_name, parameters)

    else:
        print("Please enter command.")

# Determine the operating system
os_name = platform.system()

# Set the serial port according to the operating system
if os_name == 'Linux':
    port_name = '/dev/tnt0'
elif os_name == 'Windows':
    port_name = 'COM1'
else:
    raise EnvironmentError("Unsupported operating system")

# Assuming serial port setup is correct
# Open serial port (Replace '/dev/ttyUSB0' with your port name)
ser = serial.Serial(port_name, 9600, timeout=1)  # Adjust baud rate as necessary

read_thread = threading.Thread(target=serial_read_thread, daemon=True)
read_thread.start()

# Start the periodic 'Housekeeping' command
# send_housekeeping()

while True:
    user_command()

