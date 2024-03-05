import struct
import socket
import time
import random

HOST = "localhost"

def float_to_binary_32(num):
    return ''.join('{:0>8b}'.format(c) for c in struct.pack('!f', num))

#ST3_TM_DICT = {
#    (3, 25): { "name": "TM(3,25)_report_housekeeping_parameter_report_structure", "send_interval": 1, "data": Housekeeping_ADCS_0_01 },
#}

def hex_to_command(data):
    # Dictionary mapping (service_type, service_subtype) to command names
    command_map = {
        (3, 1): "TC(3,1)_create_a_parameter_report_structure",
        (3, 9): "TC(3,9)_report_housekeeping_parameter_report_structure",
        (3, 27): "TC(3,27)_generate_a_one_shot_report_for_housekeeping_parameter_report_structures",

        (4, 1): "TC(4,1)_report_the_parameter_statistics",

        (6, 1): "TC(6,1)_load_object_memory_data",
        (6, 3): "TC(6,3)_dump_object_memory_data",

        (11, 1): "TC(11,1)_enable_time_based_scheduling",
        (11, 2): "TC(11,2)_disable_time_based_scheduling",
        (11, 3): "TC(11,3)_reset_time_based_scheduling",
        (11, 4): "TC(11,4)_time_based_scheduled_x",
        (11, 5): "TC(11,5)_delete_activities_by_id_single",
        (11, 7): "TC(11,7)_time_shift_activities_by_id_single",
        (11, 9): "TC(11,9)_report_activities_by_id_single",
        (11, 12): "TC(11,12)_summary_report_by_id",
        (11, 15): "TC(11,15)_time_shift_all_activities",
        (11, 16): "TC(11,16)_summary_report_all_activities",
        
        (17,1): "TC(17,1)_are_you_alive_connection",
        (17,3): "TC(17,3)_on_board_connection",

        (20,1): "TC(20,1)_report_value_x",
        (20,3): "TC(20,3)_set_parameter_vals",

        (23,1): "TC(23,1)_create_a_file",
        (23,2): "TC(23,2)_delete_a_file",
        (23,3): "TC(23,3)_report_the_attributes_of_a_file",
    }

    # Numbers are hex characters (2 per byte)
    radio_header_bytes = data[0:16]
    radio_footer_bytes = data[-4:0]

    ccsds_primary_bytes = data[16:28]

    tc_packet_secondary_header = data[28:38]

    packet_data = data[38:-4]

    # Extract service_type and service_subtype from the core_hex
    # Assuming they are located at a specific offset and are each one byte long

    service_type = int(tc_packet_secondary_header[2:4], 16)
    service_subtype = int(tc_packet_secondary_header[4:6], 16)

    print(service_type, service_subtype)

    # Use the extracted values to get the command name from the mapping
    command_key = (service_type, service_subtype)
    command_name = command_map.get(command_key, "Unknown Command")

    return command_name

def send_telemetry(simulator):

    SEQUENTIAL_SENDING = False

    portOBC = 10015
    tm_socket_OBC = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tm_socket_OBC.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    portADCS = 10016
    tm_socket_ADCS = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tm_socket_ADCS.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # portCAN = 10017
    # tm_socket_CAN = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # tm_socket_CAN.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    tm_socket_OBC.bind((HOST, portOBC))
    tm_socket_OBC.listen(1)
    print("\nserver "+str(portOBC)+" listening")

    tm_socket_ADCS.bind((HOST, portADCS))
    tm_socket_ADCS.listen(1)
    print("server "+str(portADCS)+" listening")

    # tm_socket_CAN.bind((HOST, portCAN))
    # tm_socket_CAN.listen(1)
    # print("server  10017 listening")

    clientconnOBC, _ = tm_socket_OBC.accept()

    clientconnADCS, _ = tm_socket_ADCS.accept()

    # clientconnCAN, _ = tm_socket_CAN.accept()

    packetCounter = 0
    simulator.tm_counter = 0
    
    last_obc_send_time = time.time() - 3  # Ensures an OBC packet is sent on the first iteration

    packetCounter = 0

    while packetCounter < 400:
        current_time = time.time()

        # Determine which packet to send
        if current_time - last_obc_send_time >= 3:
            # Time to send Housekeeping_OBC_3
            data = Housekeeping_OBC_3()
            last_obc_send_time = current_time
        else:
            # Send Housekeeping_ADCS_0_01
            data = Housekeeping_ADCS_0_01()

        # Construct and send the telemetry packet
        tm_secondary_header = create_tm_secondary_header(3, 25)
        ccsds_header = create_ccsds_header(data, tm_secondary_header)
        packet = combine_packet_information(ccsds_header, tm_secondary_header, data)
        
        acceptance = acceptance_packets()
        confirmation = confirmation_packets()

        # for binary_packet in acceptance:

        #     expected_hex_length = (len(binary_packet) // 8) * 2

        #     tm_packet = hex(int(binary_packet, 2))[2:]

        #     tm_packet_hex_padded = tm_packet.zfill(expected_hex_length)

        #     packet = bytes.fromhex(tm_packet_hex_padded)

        #     clientconnOBC.send(packet)
        #     clientconnADCS.send(packet)
        #     simulator.tm_counter += 1
        #     packetCounter += 1

        clientconnOBC.send(packet)
        clientconnADCS.send(packet)
        simulator.tm_counter += 1

        packetCounter += 1

        # for binary_packet in confirmation:

        #     expected_hex_length = (len(binary_packet) // 8) * 2

        #     tm_packet = hex(int(binary_packet, 2))[2:]

        #     tm_packet_hex_padded = tm_packet.zfill(expected_hex_length)

        #     packet = bytes.fromhex(tm_packet_hex_padded)

        #     clientconnOBC.send(packet)
        #     clientconnADCS.send(packet)
        #     simulator.tm_counter += 1
        #     packetCounter += 1

        # Adjust sleep to ensure timing accuracy, considering execution time
        sleep_time = 1 - (time.time() - current_time)
        if sleep_time > 0:
            time.sleep(sleep_time)

    clientconnOBC.close()
    clientconnADCS.close()
    # clientconnCAN.close()
    print("communication ended")

    return

def create_ccsds_header(packet_data, tm_secondary_header):
    packet_version_number = '000'
    packet_type = '0'
    secondary_header_flag = '1'
    apid = '00000000001'
    sequence_flags = '11'
    packet_name = '00000000000010'
    packet_data_length = format(((len(packet_data) + len(tm_secondary_header)) // 8) - 1, 'b').zfill(16)

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

    return data

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

    return data

def acceptance_packets():
    return [
        '000010000000000111000000000010110000000000001110001000000000000100000001000000000000000000000000000000010000111100101011110100011101000000011000000000111100000000000000',
        '0000100000000001110000000000110000000000000100000010000000000001000000100000000000000000000000000000000100001111001010111101000111010000000110000000001111000000000000000000000000000000'
    ]

def confirmation_packets():

    return [
        '000010000000000111000000000011010000000000001110001000000000000100000011000000000000000000000000000000010000111100101011110100011101000000011000000000111100000000000000',
        '0000100000000001110000000000001100000000000100000010000000000001000001000000000000000000000000000000000100001111001010111101000110011110000110000000000111000000000000000000000000001000',
        '00001000000000011100000000001111000000000000111100100000000000010000010100000000000000000000000000000001000011110010101111010001110100000001100000000011110000000000000000000000',
        '000010000000000111000000000100000000000000010001001000000000000100000110000000000000000000000000000000010000111100101011110100011101000000011000000000111100000000000000000000000000000000000000',
        '000010000000000111000000000100010000000000001110001000000000000100000111000000000000000000000000000000010000111100101011110100011101000000011000000000111100000000000000',
        '0000100000000001110000000001001000000000000100000010000000000001000010000000000000000000000000000000000100001111001010111101000111010000000110000000001111000000000000000000000000000000',
        '0000100000000001110000000001001100000000000100000010000000000001000010100000000000000000000000000000000100001111001010111101000111010000000110000000001111000000000000000000000000000000',
    ]