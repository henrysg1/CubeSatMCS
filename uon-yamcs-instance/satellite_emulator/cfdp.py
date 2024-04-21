def process_cfdp_tc(packet_data):
    data_bytes = bytes.fromhex(packet_data)

    # Convert bytes to a single integer (assuming big-endian)
    header_int = int.from_bytes(data_bytes, 'big')

    # Convert to binary, remove the '0b' prefix, and ensure it's at least 16 bits long
    binary_string = bin(header_int)[2:].zfill(len(data_bytes)*4)

    print(binary_string)

    version = binary_string[0:3]
    pdu_type = binary_string[3]
    direction = binary_string[4]
    transmission_mode = binary_string[5]
    crc_flag = binary_string[6]
    large_file_flag = binary_string[7]
    pdu_data_field_length = binary_string[8:24]
    segmentation_control = binary_string[24]
    length_of_entity_ids = binary_string[25:28]
    segment_metadata_flag = binary_string[28]
    length_of_transaction_sequence_number = binary_string[29:32]

    print(f"Version: {version}, PDU Type: {pdu_type}, Direction: {direction}, Transmission Mode: {transmission_mode}, CRC Flag: {crc_flag}, Large File Flag: {large_file_flag}, PDU Data Field Length: {pdu_data_field_length}, Segmentation Control: {segmentation_control}, Length of Entity IDs: {length_of_entity_ids}, Segment Metadata Flag: {segment_metadata_flag}, Length of Transaction Sequence Number: {length_of_transaction_sequence_number}")