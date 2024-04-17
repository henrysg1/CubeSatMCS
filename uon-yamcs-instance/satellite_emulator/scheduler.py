import time
from satellite_emulator.structures import SCHEDULE
from satellite_emulator.telemetry import Housekeeping_OBC_3, Housekeeping_ADCS_0_01

def populate_schedule():
    SCHEDULE.extend([
        {"interval": 3, "function": Housekeeping_OBC_3, "last_executed": 0},
        {"interval": 1, "function": Housekeeping_ADCS_0_01, "last_executed": 0},
    ])

def scheduler():
    populate_schedule()

    while True:
        current_time = time.time()
        for task in SCHEDULE:
            if (current_time - task["last_executed"]) >= task["interval"]:
                #task["function"]()
                pass
                #task["last_executed"] = current_time
        time.sleep(1)
