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