from satellite_emulator.telemetry import *
from satellite_emulator.networking import send_received_ack

def unimplemented_command(packet_data):
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

    tc_packet_secondary_header = data[28:38]

    packet_data = bytes.fromhex(data[38:-4])

    service_type = int(tc_packet_secondary_header[2:4], 16)
    service_subtype = int(tc_packet_secondary_header[4:6], 16)

    command_key = (service_type, service_subtype)
    command_function = command_map.get(command_key, unimplemented_command)

    send_received_ack(ccsds_primary_header)

    command_function(ccsds_primary_header, tc_packet_secondary_header, packet_data)