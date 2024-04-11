from satellite_emulator.networking import initialize_sockets
from satellite_emulator.scheduler import scheduler
from satellite_emulator.structures import PARAMETER_REPORT_STRUCTURES
from satellite_emulator.config import set_simulator
from satellite_emulator.telemetry import (
    Housekeeping_OBC_1, 
    Housekeeping_OBC_3, 
    Housekeeping_ADCS_0_01, 
    Housekeeping_ADCS_3, 
    Housekeeping_ADCS_5
)

def send_telemetry(simulator):

    simulator.tm_counter = 0

    set_simulator(simulator)
    setup_parameter_report_structures()
    initialize_sockets()
    scheduler()

if __name__ == "__main__":
    send_telemetry()

def setup_parameter_report_structures():
    PARAMETER_REPORT_STRUCTURES[0] = Housekeeping_OBC_1
    PARAMETER_REPORT_STRUCTURES[1] = Housekeeping_OBC_3
    PARAMETER_REPORT_STRUCTURES[3] = Housekeeping_ADCS_0_01
    PARAMETER_REPORT_STRUCTURES[4] = Housekeeping_ADCS_3
    PARAMETER_REPORT_STRUCTURES[5] = Housekeeping_ADCS_5