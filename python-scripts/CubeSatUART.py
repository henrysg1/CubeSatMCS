import serial
import struct
import random 
import platform
import time

from datetime import datetime
from commonRadio import calculate_checksum

status_list = ['OK', 'WARNING', 'ERROR', 'CRIT ERROR', 'OFFLINE', 'NO_RESPONSE']
state_list = ['Taking Photo', 'Moving', 'Idle', 'Calculating', 'Updating', 'Powering On', 'Powering Off', 'NO_RESPONSE']

DATA_BUFFER_DICT = {}

SYNC_CHARS = 0x4865

with open("test.jpg", "rb") as image:
    f = image.read()
    imageBytes = bytearray(f)

class RadioOperation:
    def __init__(self, op_code, name, args, total_bytes, summary):
        self.op_code = op_code
        self.name = name
        self.args = args
        self.total_bytes = total_bytes
        self.summary = summary

    def execute(self):
        # Placeholder for operation execution logic
        print(f"Executing {self.name}")

beacon_status = False
payload_status = False

def set_beacon_status(status):
    beacon_status = status
    return "Beacon Activated" if status else "Beacon Deactivated"

def set_payload_status(status):
    payload_status = status
    return "Payload Activated" if status else "Payload Deactivated"

def declare_command_dict():
    x_pos = random.randrange(200)
    y_pos = random.randrange(200)
    z_pos = random.randrange(1000)
    system_temperature = random.randrange(100)

    difference = datetime(2024,1,1) - datetime.now()
    operational_time = difference.total_seconds()

    memory_status = random.randrange(100)

    system_status = "Status: " + random.choice(status_list)
    housekeeping = "State: " + random.choice(state_list) + " X Pos: " + str(x_pos) + " Y Pos: " + str(y_pos) + " Z Pos: " + str(z_pos) + \
                " Temp: " + str(system_temperature) + " Operational Time: " + str(operational_time) + " Memory: " + str(memory_status) + "MB"

    battery_percentage = random.randrange(100)

    # Command mapping to operation codes and expected parameter count
    return {
        # System Check Commands
        0x00: {"command_name": "SystemStatus", "param_list": [], "return": system_status},
        0x01: {"command_name": "Housekeeping", "param_list": [], "return": housekeeping},
        0x02: {"command_name": "MemoryCheck", "param_list": [{"param_name": "address", "param_length": 1 }, {"param_name": "length", "param_length": 2}], "return": "NEED_TO_IMPLEMENT"},
        0x03: {"command_name": "BatteryStatus", "param_list": [], "return": str(battery_percentage)},
        0x04: {"command_name": "MemoryStatus", "param_list": [], "return": str(memory_status)},
        # Communication Commands
        0x10: {"command_name": "BeaconActivate", "param_list": [], "return": set_beacon_status(True)},
        0x11: {"command_name": "BeaconDeactivate", "param_list": [], "return": set_beacon_status(False)},
        0x12: {"command_name": "SendBeaconStatus", "param_list": [], "return": str(beacon_status)},
        # Data Handling Commands
        0x20: {"command_name": "RequestFiles", "param_list": [{"param_name": "file_type", "param_length": 1 }, {"param_name": "file_count", "param_length": 2}], "return": "Files Requested"},
        0x21: {"command_name": "SendFile", "param_list": [{"param_name": "file_type", "param_length": 1 }, {"param_name": "file_count", "param_length": 2}], "return": "File Sent"},
        0x22: {"command_name": "DeleteFile", "param_list": [{"param_name": "file_type", "param_length": 1 }], "return": "File Deleted"},
        # Imaging Commands
        0x30: {"command_name": "TakePhoto", "param_list": [{"param_name": "photo_type", "param_length": 1 }, {"param_name": "photo_count", "param_length": 2}], "return": imageBytes},
        0x31: {"command_name": "SchedulePhoto", "param_list": [{"param_name": "photo_type", "param_length": 1 }, {"param_name": "photo_count", "param_length": 2}], "return": "Photo Scheduled"},
        0x32: {"command_name": "PhotoStatus", "param_list": [], "return": "Photo Status"},
        # Payload Management Commands
        0x40: {"command_name": "ActivatePayload", "param_list": [{"param_name": "payload_type", "param_length": 1 }], "return": set_payload_status(True)},
        0x41: {"command_name": "DeactivatePayload", "param_list": [{"param_name": "payload_type", "param_length": 1 }], "return": set_payload_status(False)},
        0x42: {"command_name": "PayloadStatus", "param_list": [], "return": str(payload_status)},
        # Reprogramming Commands
        0x50: {"command_name": "ReprogramAbacus", "param_list": [{"param_name": "reprogram_type", "param_length": 1 }], "return": "Abacus Reprogrammed"},
        0x51: {"command_name": "UpdateSoftware", "param_list": [{"param_name": "software_type", "param_length": 1 }, {"param_name": "software_version", "param_length": 2}], "return": "Software Updated"},
        # Diagnostic and Debugging Commands
        0x60: {"command_name": "RunDiagnostics", "param_list": [{"param_name": "diagnostic_type", "param_length": 1 }], "return": "Diagnostics Run"},
        0x61: {"command_name": "ErrorLogRequest", "param_list": [{"param_name": "error_type", "param_length": 1 }, {"param_name": "error_count", "param_length": 2}], "return": "Error Log Requested"},
        0x62: {"command_name": "ResetSystem", "param_list": [{"param_name": "reset_type", "param_length": 1 }], "return": "System Reset"},
        # Dummy Commands
        0x70: {"command_name": "DummyCommand0", "param_list": [], "return": "Dummy Command 0"},
        0x71: {"command_name": "DummyCommand1", "param_list": [], "return": "Dummy Command 1"},
        # Specific Mission Commands
        0x80: {"command_name": "CustomCommand0", "param_list": [], "return": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx"},
        0x81: {"command_name": "ExperimentalFeature", "param_list": [{"param_name": "feature_type", "param_length": 1 }, {"param_name": "feature_count", "param_length": 2}], "return": "Experimental Feature"},
        # Power Management Commands
        0x90: {"command_name": "PowerDown", "param_list": [{"param_name": "power_type", "param_length": 1 }, {"param_name": "power_count", "param_length": 2}], "return": "Power Down"},
        0x91: {"command_name": "PowerUp", "param_list": [{"param_name": "power_type", "param_length": 1 }], "return": "Power Up"},
        # Orientation and Movement Commands
        0xA0: {"command_name": "AdjustOrientation", "param_list": [{"param_name": "orientation_type", "param_length": 1 }, {"param_name": "orientation_count", "param_length": 2}], "return": "Orientation Adjusted"},
        0xA1: {"command_name": "MoveToCoordinates", "param_list": [{"param_name": "x_pos", "param_length": 2 }, {"param_name": "y_pos", "param_length": 2}], "return": "Moved to Coordinates"},
        # Emergency Commands
        0xB0: {"command_name": "EmergencyShutdown", "param_list": [], "return": "Emergency Shutdown"},
        0xB1: {"command_name": "SafeMode", "param_list": [{"param_name": "mode_type", "param_length": 1 }, {"param_name": "mode_count", "param_length": 2}], "return": "Safe Mode"},
    }

def resend_lost_packets(data):
    # First byte of data is the command type to send packets to
    resend_command_type = struct.unpack('!B', data[11:12])[0]
    # Assuming 'data' is a bytes-like object
    data_slice = data[12:-4]
    num_2byte_segments = len(data_slice) // 2  # Calculate number of 2-byte segments

    # Unpack each 2-byte segment into a list of numbers
    resend_packet_numbers = [struct.unpack('!H', data_slice[i*2:(i+1)*2])[0] for i in range(num_2byte_segments)]

    if resend_command_type in DATA_BUFFER_DICT:
        for packet_number in resend_packet_numbers:
            packet = DATA_BUFFER_DICT[resend_command_type][packet_number]
            time.sleep(0.2)
            ser.write(packet)
            print(f"Resent packet number: {packet_number} with length: {len(packet)} bytes")
    send_termination_packet(resend_command_type)

def remove_buffered_data(data):
    # First byte of data is the command type to remove packets from
    remove_command_type = struct.unpack('!B', data[11:12])[0]
    if remove_command_type in DATA_BUFFER_DICT:
        DATA_BUFFER_DICT.pop(remove_command_type)
        print(f"Removed buffered data for command type: {remove_command_type}")

def send_termination_packet(packet_command_type):
    if random.randrange(10) == 0:
        print("Termination packet lost")
        return
    termination_packet_bytes = struct.pack('HHH', SYNC_CHARS, 0x2004, 0x0003) # 3 for packet number bytes
    header_check_sum_A, header_check_sum_B = calculate_checksum(termination_packet_bytes)
    termination_header_packet = struct.pack('!HHHBB', SYNC_CHARS, 0x2004, 0x0003, header_check_sum_A, header_check_sum_B)

    termination_data_packet = struct.pack('!BH', packet_command_type, 0xFFFF)
    data_check_sum_A, data_check_sum_B = calculate_checksum(termination_data_packet)
    data_packet = termination_data_packet + struct.pack('!BB', data_check_sum_A, data_check_sum_B)
    payload_check_sum_A, payload_check_sum_B = calculate_checksum(termination_header_packet + data_packet)

    termination_packet = termination_header_packet + data_packet + struct.pack('!BB', payload_check_sum_A, payload_check_sum_B)
    
    time.sleep(0.2)
    ser.write(termination_packet)
    print(f"Sent termination packet: {0xFFFF} with length: {len(termination_packet)} bytes")

def receive_and_send_response(data, acknowledgment_operations_dict):
    if len(data) >= 8:  # Ensure there's enough data to extract the operation code

        packet_format = '!HHHBB'  # This format string expects 8 items, which matches the provided arguments.
        command_type = 0xFFFF
        command_success_bytes = 0x0A0A
        command_failed_bytes = 0xFFFF

        sync_chars = struct.unpack('!H', data[0:2])[0]
        op_code = struct.unpack('!H', data[2:4])[0] 
        packet_length = struct.unpack('!H', data[4:6])[0]
        received_check_sum_A = struct.unpack('!B', data[6:7])[0]
        received_check_sum_B = struct.unpack('!B', data[7:8])[0]

        received_header_bytes = struct.pack('!HHH', sync_chars, op_code, packet_length)
        header_check_sum_A, header_check_sum_B = calculate_checksum(received_header_bytes)

        for byte in data:
            print(f"{byte:02X}", end=' ')

        print(f"Header Checksum A: {header_check_sum_A}, Header Checksum B: {header_check_sum_B}, Received Checksum A: {received_check_sum_A}, Received Checksum B: {received_check_sum_B}")

        if header_check_sum_A != received_check_sum_A or header_check_sum_B != received_check_sum_B:
            print("Invalid Checksum")
            return
        
        # Prepare response based on whether the op_code is recognized
        if (op_code in acknowledgment_operations_dict and random.randrange(10) != 0):
            # Recognized operation, send success response
            command_type = acknowledgment_operations_dict[op_code].op_code
            success_bytes = struct.pack('HHH', SYNC_CHARS, command_type, command_success_bytes)
            header_check_sum_A, header_check_sum_B = calculate_checksum(success_bytes)
            success_packet = struct.pack(packet_format, SYNC_CHARS, command_type, command_success_bytes, header_check_sum_A, header_check_sum_B)
            ser.write(success_packet)
            # Assuming this part of your code is where you need to modify
            if (op_code == 0x1003):
                command_mapping = declare_command_dict()
                packet_command_type = struct.unpack('!B', data[8:9])[0]

                if packet_command_type == 0xFF:
                    resend_lost_packets(data)
                    send_termination_packet(packet_command_type)
                    return

                if packet_command_type == 0xFA:
                    remove_buffered_data(data)
                    return

                if packet_command_type in command_mapping:
                    command = command_mapping[packet_command_type]

                    # Buffer data in case of packet loss
                    DATA_BUFFER_DICT[packet_command_type] = {}

                    try:
                        return_bytes = command['return'].encode()
                    except (UnicodeEncodeError, AttributeError):
                        return_bytes = command['return']

                    chunks = [return_bytes[i:i+250] for i in range(0, len(return_bytes), 250)]

                    for packet_number, chunk in enumerate(chunks):
                        return_length = len(chunk)
                        packet_bytes = struct.pack('HHH', SYNC_CHARS, 0x2004, return_length + 5) # +5 for command_type, packet_number and payload checksums
                        header_check_sum_A, header_check_sum_B = calculate_checksum(packet_bytes)
                        payload_header_packet = struct.pack('!HHHBB', SYNC_CHARS, 0x2004, return_length + 5, header_check_sum_A, header_check_sum_B)

                        data_header_bytes = struct.pack('!BH', packet_command_type, packet_number)
                        data_check_sum_A, data_check_sum_B = calculate_checksum(data_header_bytes + chunk)
                        data_packet = data_header_bytes + chunk + struct.pack('!BB', data_check_sum_A, data_check_sum_B)
                        payload_check_sum_A, payload_check_sum_B = calculate_checksum(payload_header_packet + data_packet)

                        packet = payload_header_packet + data_packet + struct.pack('!BB', payload_check_sum_A, payload_check_sum_B)

                        if random.randrange(10) != 0:
                            time.sleep(0.2)
                            ser.write(packet)
                            print(f"Sent packet number: {packet_number} with length: {len(packet)} bytes")
                        else:
                            print(f"Packet number: {packet_number} lost")
                        DATA_BUFFER_DICT[packet_command_type][packet_number] = packet
                    
                    # Send termination packet
                    send_termination_packet(packet_command_type)

        else:
            # Unrecognized operation, send failure response
            failed_bytes = struct.pack('HHH', SYNC_CHARS, command_type, command_failed_bytes)
            header_check_sum_A, header_check_sum_B = calculate_checksum(failed_bytes)
            failed_packet = struct.pack(packet_format, SYNC_CHARS, command_type, command_failed_bytes, header_check_sum_A, header_check_sum_B)
            ser.write(failed_packet)
    return

acknowledgment_operations_dict = {
    0x1001 : RadioOperation(0x2001, "No-Op Ack", [], 0, "No-op Acknowledge."),
    0x1002 : RadioOperation(0x2002, "Reset Ack", [], 0, "Reset acknowledge."),
    0x1003 : RadioOperation(0x2003, "Transmit Ack", [], 0, "Transmit acknowledge."),
    0x1004 : RadioOperation(0x2004, "Received Data", [], 0, "Received n number of bytes AX.25 packet."),
    0x1005 : RadioOperation(0x2005, "Transceiver Configuration", [], 0, "Radio configuration structure."),
    0x1006 : RadioOperation(0x2006, "Set Transceiver Configuration Ack", [], 0, "Set radio configuration Acknowledge."),
    0x1007 : RadioOperation(0x2007, "Telemetry", [], 0, "Telemetry frame."),
    0x1008 : RadioOperation(0x2008, "Write Flash Ack", [], 0, "Write Flash Acknowledge."),
    0x1009 : RadioOperation(0x2009, "RF Configure Ack", [], 0, "RF Configuration Acknowledge."),
    0x1010 : RadioOperation(0x2010, "Beacon Data Ack", [], 0, "Ack Set Beacon Contents."),
    0x1011 : RadioOperation(0x2011, "Beacon Conf. Ack", [], 0, "Ack Beacon Configuration."),
    0x1012 : RadioOperation(0x2012, "Firmware Rev", [], 4, "Firmware number, float 4 byte."),
    0x1013 : RadioOperation(0x2013, "DIO Key Write Ack", [], 0, "Ack DIO Key Write."),
    0x1014 : RadioOperation(0x2014, "Firmware Update Ack", [], 0, "Firmware Update Ack."),
    0x1015 : RadioOperation(0x2015, "Firmware Packet Ack", [], 0, "Firmware Packet Ack."),
    0x1020 : RadioOperation(0x2020, "Fast Set PA Ack", [], 0, "Power Amplifier Set Ack"),
}

# Determine the operating system
os_name = platform.system()

# Set the serial port according to the operating system
if os_name == 'Linux':
    port_name = '/dev/tnt0'
elif os_name == 'Windows':
    port_name = 'COM2'
else:
    raise EnvironmentError("Unsupported operating system")

# Open the serial port
ser = serial.Serial(port_name, 9600, timeout=1)

while True:
    # Check if there is any data waiting to be read
    if ser.in_waiting > 0:
        # Read all available data
        data = ser.read(ser.in_waiting)
        receive_and_send_response(data, acknowledgment_operations_dict)

    
