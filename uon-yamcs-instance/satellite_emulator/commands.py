import os

from satellite_emulator.telemetry import *
from satellite_emulator.networking import send_received_ack
from satellite_emulator.cfdp import process_cfdp_tc

def unimplemented_command(ccsds_primary_header, tc_packet_secondary_header, packet_data):
    print("Unimplemented command")

def hex_to_command(data):
    # Access the RADIO_TYPE environment variable
    radio_type = os.getenv("RADIO_TYPE")

    if radio_type == "lithium2":
        # Preserves the original behavior for 'lithium2'
        radio_header_bytes = data[0:16]
        radio_footer_bytes = data[-4:0]
        offset = 16
        footer_cut = -4
    else:
        # Skip header and footer processing if not 'lithium2'
        offset = 0
        footer_cut = None  # This sets it to use the full data array to the end

    # Parse headers and packet data based on the calculated offsets
    ccsds_primary_header = data[offset:offset+12]

    data_bytes = bytes.fromhex(ccsds_primary_header[:4])
    header_int = int.from_bytes(data_bytes, 'big')
    binary_string = bin(header_int)[2:].zfill(16)
    last_11_bits = binary_string[-11:]

    if last_11_bits == '00000100100':
        process_cfdp_tc(data[offset+24:footer_cut])
        return

    tc_packet_secondary_header = data[offset+12:offset+22]
    packet_data = bytes.fromhex(data[offset+22:footer_cut])

    service_type = int(tc_packet_secondary_header[2:4], 16)
    service_subtype = int(tc_packet_secondary_header[4:6], 16)

    command_key = (service_type, service_subtype)
    command_function = command_map.get(command_key, unimplemented_command)

    send_received_ack(ccsds_primary_header)
    command_function(ccsds_primary_header, tc_packet_secondary_header, packet_data)

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