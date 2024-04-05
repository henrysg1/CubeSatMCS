import struct
import socket
import time
import random

HOST = "localhost"

CLIENT_CONN_OBC = None
CLIENT_CONN_ADCS = None
SIMULATOR = None

def float_to_binary_32(num):
    return ''.join('{:0>8b}'.format(c) for c in struct.pack('!f', num))

def scheduler():

    while True:
        current_time = time.time()
        schedule = SCHEDULE
        for task in schedule:
            if (current_time - task["last_executed"]) >= task["interval"]:
                task["function"]()
                task["last_executed"] = current_time
        time.sleep(1)

def initialize_sockets():
    
    global CLIENT_CONN_OBC, CLIENT_CONN_ADCS

    try:
        portOBC = 10015
        tm_socket_OBC = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        tm_socket_OBC.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        tm_socket_OBC.bind((HOST, portOBC))
        tm_socket_OBC.listen(1)
        print(f"\nServer {portOBC} listening")

        portADCS = 10016
        tm_socket_ADCS = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        tm_socket_ADCS.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        tm_socket_ADCS.bind((HOST, portADCS))
        tm_socket_ADCS.listen(1)
        print(f"Server {portADCS} listening")

        CLIENT_CONN_OBC, _ = tm_socket_OBC.accept()
        CLIENT_CONN_ADCS, _ = tm_socket_ADCS.accept()

    except Exception as e:
        print("Failed to initialize sockets:", str(e))
        raise

def send_packet(data):
    global CLIENT_CONN_OBC, CLIENT_CONN_ADCS
    data_chunks = split_data_into_chunks(data)
    total_chunks = len(data_chunks)
    packet_number = 0

    for i, chunk in enumerate(data_chunks):
        # Set default sequence_flags for a single packet or adjust for multiple
        if total_chunks == 1:  # Only one packet
            sequence_flags = '11'
        elif i == 0:  # First packet in a sequence
            sequence_flags = '01'
        elif i == total_chunks - 1:  # Last packet in a sequence
            sequence_flags = '10'
        else:  # Intermediate packet
            sequence_flags = '00'

        packet_name = format(packet_number, '014b')
        tm_secondary_header = create_tm_secondary_header(3, 25)
        ccsds_header = create_ccsds_header(chunk, tm_secondary_header, sequence_flags, packet_name)
        packet = combine_packet_information(ccsds_header, tm_secondary_header, chunk)

        try:
            if CLIENT_CONN_OBC:
                CLIENT_CONN_OBC.send(packet)
            if CLIENT_CONN_ADCS:
                CLIENT_CONN_ADCS.send(packet)
            SIMULATOR.tm_counter += 1
        except (BrokenPipeError, ConnectionResetError) as e:
            print("Connection lost. Attempting to reconnect...")
            CLIENT_CONN_OBC = None  # Reset connection
            CLIENT_CONN_ADCS = None  # Reset connection
            reconnect()

        packet_number += 1

def reconnect():

    global CLIENT_CONN_OBC, CLIENT_CONN_ADCS

    while CLIENT_CONN_OBC is None or CLIENT_CONN_ADCS is None:
        try:
            initialize_sockets()  # Attempt to reinitialize connections
            print("Reconnected to the server.")
        except socket.error as e:
            print("Connection failed. Retrying in 5 seconds...")
            time.sleep(5)

def unimplemented_command(packet_data):
    print("Unimplemented command")

def TC_3_27_generate_a_one_shot_report_for_housekeeping_parameter_report_structures(packet_data):

    # Use the first byte to determine the loop count
    loop_count = packet_data[0]

    # Iterate over the remaining data, one byte at a time
    for i in range(1, 1 + loop_count):
        PARAMETER_REPORT_STRUCTURES[packet_data[i]]()

def hex_to_command(data):
    # Dictionary mapping (service_type, service_subtype) to command names
    command_map = {
        (3, 1): unimplemented_command,
        (3, 9): unimplemented_command,
        (3, 27): TC_3_27_generate_a_one_shot_report_for_housekeeping_parameter_report_structures,

        (4, 1): unimplemented_command,

        (6, 1): unimplemented_command,
        (6, 3): unimplemented_command,

        (11, 1): unimplemented_command,
        (11, 2): unimplemented_command,
        (11, 3): unimplemented_command,
        (11, 4): unimplemented_command,
        (11, 5): unimplemented_command,
        (11, 7): unimplemented_command,
        (11, 9): unimplemented_command,
        (11, 12): unimplemented_command,
        (11, 15): unimplemented_command,
        (11, 16): unimplemented_command,
        
        (17,1): unimplemented_command,
        (17,3): unimplemented_command,

        (20,1): unimplemented_command,
        (20,3): unimplemented_command,

        (23,1): unimplemented_command,
        (23,2): unimplemented_command,
        (23,3): unimplemented_command,
    }

    # Numbers are hex characters (2 per byte)
    radio_header_bytes = data[0:16]
    radio_footer_bytes = data[-4:0]

    ccsds_primary_bytes = data[16:28]

    tc_packet_secondary_header = data[28:38]

    packet_data = bytes.fromhex(data[38:-4])

    service_type = int(tc_packet_secondary_header[2:4], 16)
    service_subtype = int(tc_packet_secondary_header[4:6], 16)

    command_key = (service_type, service_subtype)
    command_function = command_map.get(command_key, unimplemented_command)

    command_function(packet_data)

def send_telemetry(simulator):
    global SIMULATOR


    simulator.tm_counter = 0

    SIMULATOR = simulator
    
    initialize_sockets()

    scheduler()

    return

def split_data_into_chunks(data, chunk_size=242):
    return [data[i:i+chunk_size] for i in range(0, len(data), chunk_size)]

def create_ccsds_header(data, tm_secondary_header, sequence_flags='11', packet_name='00000000000000'):
    packet_version_number = '000'
    packet_type = '0'
    secondary_header_flag = '1'
    apid = '00000000001'
    packet_data_length = format(((len(data) + len(tm_secondary_header)) // 8) - 1, '016b')

    ccsds_header = packet_version_number + packet_type + secondary_header_flag + apid + sequence_flags + packet_name + packet_data_length
    return ccsds_header

def create_tm_secondary_header(service_type, service_subtype):
    tm_packet_pus_version_number = '0010'
    spacecraft_time_reference_status = '0000'
    service_type = f'{service_type:08b}'
    service_subtype = f'{service_subtype:08b}'
    message_type_counter = '0000000000000000'
    destination_ID = '0000000000000001'

    # Get the current time in seconds since the epoch
    current_time_seconds = int(time.time())

    # Convert to a binary string
    send_time = format(current_time_seconds, '032b')

    tm_secondary_header = tm_packet_pus_version_number + spacecraft_time_reference_status + service_type + service_subtype + message_type_counter + destination_ID + send_time

    return tm_secondary_header

def combine_packet_information(ccsds_header, tm_secondary_header, packet_data):
    packet_bits = ccsds_header + tm_secondary_header + packet_data

    expected_hex_length = (len(packet_bits) // 8) * 2

    tm_packet = hex(int(packet_bits, 2))[2:]

    tm_packet_hex_padded = tm_packet.zfill(expected_hex_length)

    tm_packet_bytes = bytes.fromhex(tm_packet_hex_padded)

    return tm_packet_bytes

def Housekeeping_OBC_1():
    enum_type = '00000000'

    obc_pcb_board_temperature_1 = float_to_binary_32(random.uniform(18, 35))
    obc_pcb_board_temperature_2 = float_to_binary_32(random.uniform(18, 35))
    obc_mcu_temperature = float_to_binary_32(random.uniform(18, 35))
    obc_boot_counter = format(random.randint(0, 255), '016b')
    obc_memory_partition = '00000001'
    obc_mcu_sys_tick = format(random.randint(0, 4294967295), '032b')
    obc_can_bus_load_1 = float_to_binary_32(random.uniform(0, 100))
    obc_can_bus_load_2 = float_to_binary_32(random.uniform(0, 100))
    obc_can_bus_active = format(random.randint(0, 1), '08b')
    obc_nand_flash_lcl_threshold = float_to_binary_32(random.uniform(0, 100))
    obc_mram_lcl_threshold = float_to_binary_32(random.uniform(0, 100))
    obc_nand_flash_on = float_to_binary_32(random.uniform(0, 255))
    obc_mram_on = float_to_binary_32(random.uniform(0, 255))
    available_heap = format(random.randint(0, 511), '016b')
    obc_use_can = format(random.randint(0, 1), '08b')
    obc_use_uart = format(random.randint(0, 1), '08b')
    obc_use_rtt = format(random.randint(0, 1), '08b')

    data = enum_type + obc_pcb_board_temperature_1 + obc_pcb_board_temperature_2 + obc_mcu_temperature + obc_boot_counter + obc_memory_partition + obc_mcu_sys_tick + obc_can_bus_load_1 + obc_can_bus_load_2 + obc_can_bus_active + obc_nand_flash_lcl_threshold + obc_mram_lcl_threshold + obc_nand_flash_on + obc_mram_on + available_heap + obc_use_can + obc_use_uart + obc_use_rtt 

    send_packet(data)

def Housekeeping_OBC_3():
    enum_type = '00000001'

    obc_pcb_board_temperature_1 = float_to_binary_32(random.uniform(18, 35))
    obc_pcb_board_temperature_2 = float_to_binary_32(random.uniform(18, 35))
    obc_spacecraft_time_ref = '00000000'
    obc_operational_mode = '00000001'
    obc_memory_partition = '00000001'
    obc_reconfiguration_timer = '00000000000000000000000011111111'
    obc_last_failed_event = '0101010101010101'
    obc_mcu_sys_tick = '00000000000000000000111111111111'

    data = enum_type + obc_pcb_board_temperature_1 + obc_pcb_board_temperature_2 + obc_spacecraft_time_ref + obc_operational_mode + obc_memory_partition + obc_reconfiguration_timer + obc_last_failed_event + obc_mcu_sys_tick

    send_packet(data)

def Housekeeping_ADCS_0_01():
    # Create data for the TM packet    
    enum_type = '00000011'

    adcs_magnetometer_raw_x = format(random.randint(0, 100), '08b')
    adcs_magnetometer_raw_y = format(random.randint(0, 100), '08b')
    adcs_magnetometer_raw_z = format(random.randint(0, 100), '08b')
    adcs_gyroscope_x = format(random.randint(0, 1000000), '032b')
    adcs_gyroscope_y = format(random.randint(0, 1000000), '032b')
    adcs_gyroscope_z = format(random.randint(0, 1000000), '032b')

    data = enum_type + adcs_magnetometer_raw_x + adcs_magnetometer_raw_y + adcs_magnetometer_raw_z + adcs_gyroscope_x + adcs_gyroscope_y + adcs_gyroscope_z

    send_packet(data)

def Housekeeping_ADCS_3():
    # Create data for the TM packet    
    enum_type = '00000100'

    adcs_magnetometer_frequency = format(random.randint(0, 100), '08b')
    adcs_magnetometer_cycle_count_x = format(random.randint(0, 127), '08b')
    adcs_magnetometer_cycle_count_y = format(random.randint(0, 127), '08b')
    adcs_magnetometer_cycle_count_z = format(random.randint(0, 127), '08b')
    adcs_magnetometer_self_test = format(random.randint(0, 1), '08b')
    adcs_gyroscope_x_temperature = float_to_binary_32(random.uniform(18, 35))
    adcs_gyroscope_y_temperature = float_to_binary_32(random.uniform(18, 35))
    adcs_gyroscope_z_temperature = float_to_binary_32(random.uniform(18, 35))
    adcs_board_temperature_1 = float_to_binary_32(random.uniform(18, 35))
    adcs_board_temperature_2 = float_to_binary_32(random.uniform(18, 35))
    adcs_mcu_temperature = float_to_binary_32(random.uniform(18, 35))
    adcs_boot_counter = format(random.randint(0, 255), '016b')
    adcs_mcu_on_board_time = float_to_binary_32(random.uniform(0, 4294967295))
    adcs_systick = format(random.randint(0, 4294967295), '064b')

    data = enum_type + adcs_magnetometer_frequency + adcs_magnetometer_cycle_count_x + adcs_magnetometer_cycle_count_y + adcs_magnetometer_cycle_count_z + adcs_magnetometer_self_test + adcs_gyroscope_x_temperature + adcs_gyroscope_y_temperature + adcs_gyroscope_z_temperature + adcs_board_temperature_1 + adcs_board_temperature_2 + adcs_mcu_temperature + adcs_boot_counter + adcs_mcu_on_board_time + adcs_systick

    send_packet(data)

def Housekeeping_ADCS_5():
    enum_type = '00000101'

    adcs_magnetometer_sign_x = '00000001'
    adcs_magnetometer_sign_y = '00000000'
    adcs_magnetometer_sign_z = '00000001'
    adcs_gyroscope_sign_x = '00000001'
    adcs_gyroscope_sign_y = '00000000'
    adcs_gyroscope_sign_z = '00000000'
    adcs_gyroscope_bias_x = float_to_binary_32(random.uniform(0, 1))
    adcs_gyroscope_bias_y = float_to_binary_32(random.uniform(0, 1))
    adcs_gyroscope_bias_z = float_to_binary_32(random.uniform(0, 1))
    adcs_flash_int = format(random.randint(0, 1000000), '032b')
    adcs_sram_int = format(random.randint(0, 1000000), '032b')

    data = enum_type + adcs_magnetometer_sign_x + adcs_magnetometer_sign_y + adcs_magnetometer_sign_z + adcs_gyroscope_sign_x + adcs_gyroscope_sign_y + adcs_gyroscope_sign_z + adcs_gyroscope_bias_x + adcs_gyroscope_bias_y + adcs_gyroscope_bias_z + adcs_flash_int + adcs_sram_int

    send_packet(data)

SCHEDULE = [
    {"interval": 3, "function": Housekeeping_OBC_3, "last_executed": 0},
    {"interval": 1, "function": Housekeeping_ADCS_0_01, "last_executed": 0},
]  

PARAMETER_REPORT_STRUCTURES = { 0: Housekeeping_OBC_1,
                                1: Housekeeping_OBC_3,
                                3: Housekeeping_ADCS_0_01,
                                4: Housekeeping_ADCS_3,
                                5: Housekeeping_ADCS_5,
                              }
