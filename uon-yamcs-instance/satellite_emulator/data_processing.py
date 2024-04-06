import struct
import time

import satellite_emulator.config as config

def split_data_into_chunks(data, chunk_size=config.PACKET_DATA_SIZE_BITS):
    return [data[i:i+chunk_size] for i in range(0, len(data), chunk_size)]

def create_ccsds_header(data, tm_secondary_header, sequence_flags='11', packet_name='00000000000000'):
    packet_version_number = '000'
    packet_type = '0'
    secondary_header_flag = '1'
    apid = '00000000001'
    packet_data_length = format(((len(data) + len(tm_secondary_header)) // 8) - 1, '016b')

    ccsds_header = packet_version_number + packet_type + secondary_header_flag + apid + sequence_flags + packet_name + packet_data_length
    return ccsds_header

def create_tm_secondary_header(service_type, service_subtype, packet_name='0000000000000000'):
    tm_packet_pus_version_number = '0010'
    spacecraft_time_reference_status = '0000'
    service_type = f'{service_type:08b}'
    service_subtype = f'{service_subtype:08b}'
    message_type_counter = packet_name
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

def float_to_binary_32(num):
    return ''.join('{:0>8b}'.format(c) for c in struct.pack('!f', num))