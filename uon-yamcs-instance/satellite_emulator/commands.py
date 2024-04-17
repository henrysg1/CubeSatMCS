from satellite_emulator.telemetry import *
from satellite_emulator.networking import send_received_ack
from satellite_emulator.cfdp import process_cfdp_tc

def unimplemented_command(ccsds_primary_header, tc_packet_secondary_header, packet_data):
    print("Unimplemented command")

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

    ccsds_primary_header = data[16:28]

    data_bytes = bytes.fromhex(ccsds_primary_header[:4])

    header_int = int.from_bytes(data_bytes, 'big')

    binary_string = bin(header_int)[2:].zfill(16)

    last_11_bits = binary_string[-11:]

    if last_11_bits == '00000100100':
        process_cfdp_tc(data[40:-4])
        return
    
    data_bytes = bytes.fromhex(ccsds_primary_header)
    header_int = int.from_bytes(data_bytes, 'big')
    binary_string = bin(header_int)[2:].zfill(48)

    tc_packet_secondary_header = data[28:38]

    tc_packet_secondary_header_bytes = bytes.fromhex(tc_packet_secondary_header)
    tc_packet_secondary_header_int = int.from_bytes(tc_packet_secondary_header_bytes, 'big')
    tc_packet_secondary_header_binary = bin(tc_packet_secondary_header_int)[2:].zfill(40)

    packet_data = bytes.fromhex(data[38:-4])

    service_type = int(tc_packet_secondary_header[2:4], 16)
    service_subtype = int(tc_packet_secondary_header[4:6], 16)

    print("=====================================================")
    print("NEW TC PACKET RECEIVED")
    print("=====================================================")
    print("Lithium Header Data: ")
    print("=====================================================")
    print("Sync Characters: ", "4865")
    print("Command Type: ", "2004")
    print("Payload Length: ", int(radio_header_bytes[8:12], 16))
    print("Header Checksum: ", radio_header_bytes[12:16])
    print("Payload Checksum: ", radio_footer_bytes[:4])
    print("=====================================================")
    print("CCSDS Primary Header Data: ")
    print("=====================================================")
    print("Packet Version Number: ", int(binary_string[:3], 2))
    print("Packet Type: ", "TC" if binary_string[3] == '1' else "TM")
    print("Secondary Header Flag: ", binary_string[4])
    print("APID: ", int(binary_string[5:16], 2))
    print("Sequence Flags: ", binary_string[16:18])
    print("Packet Name: ", int(binary_string[18:32], 2))
    print("Packet Data Length: ", int(binary_string[32:48], 2))
    print("=====================================================")
    print("CCSDS Secondary Header Data: ")
    print("=====================================================")
    print("PUS Version Number: ", int(tc_packet_secondary_header[0], 4))
    print("Acknowledgement flags: ", tc_packet_secondary_header_binary[4:8])
    print("Service Type ID: ", service_type)
    print("Message Subtype ID: ", service_subtype)
    print("Source ID: ", int(tc_packet_secondary_header[8:16], 32))
    print("=====================================================")


    command_key = (service_type, service_subtype)
    command_function = command_map.get(command_key, unimplemented_command)

    send_received_ack(ccsds_primary_header)

    command_function(ccsds_primary_header, tc_packet_secondary_header, packet_data)