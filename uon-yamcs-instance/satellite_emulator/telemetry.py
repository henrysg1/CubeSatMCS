import random

from satellite_emulator.structures import PARAMETER_REPORT_STRUCTURES
from satellite_emulator.data_processing import float_to_binary_32
from satellite_emulator.networking import send_packet, send_start_of_execution, send_execution_progress, send_completion_ack

def TC_3_27_generate_a_one_shot_report_for_housekeeping_parameter_report_structures(ccsds_header, secondary_header, packet_data):

    send_start_of_execution(ccsds_header)
    # Use the first byte to determine the loop count
    loop_count = packet_data[0]

    send_execution_progress(ccsds_header, 1)
    send_completion_ack(ccsds_header)
    # Iterate over the remaining data, one byte at a time
    for i in range(1, 1 + loop_count):
        PARAMETER_REPORT_STRUCTURES[packet_data[i]]()

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

    send_packet(data, 3, 25)

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

    send_packet(data, 3, 25)

def Housekeeping_ADCS_0_01():
    # Create data for the TM packet    
    enum_type = '00000011'

    adcs_magnetometer_raw_x = format(random.randint(0, 100), '08b')
    adcs_magnetometer_raw_y = format(random.randint(0, 100), '08b')
    adcs_magnetometer_raw_z = format(random.randint(0, 100), '08b')
    adcs_gyroscope_x = format(random.randint(0, 45), '032b')
    adcs_gyroscope_y = format(random.randint(0, 45), '032b')
    adcs_gyroscope_z = format(random.randint(0, 45), '032b')

    data = enum_type + adcs_magnetometer_raw_x + adcs_magnetometer_raw_y + adcs_magnetometer_raw_z + adcs_gyroscope_x + adcs_gyroscope_y + adcs_gyroscope_z

    send_packet(data, 3, 25)

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

    send_packet(data, 3, 25)

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

    send_packet(data, 3, 25)