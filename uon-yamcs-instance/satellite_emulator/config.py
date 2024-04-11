HOST = "localhost"

CLIENT_CONN_SAIL = None
CLIENT_CONN_JAM = None
CLIENT_CONN_COMMS = None
CLIENT_CONN_OBC = None
CLIENT_CONN_ADCS = None

PACKET_DATA_SIZE_BITS = 239*8

_SIMULATOR = None 

def get_simulator():
    global _SIMULATOR
    return _SIMULATOR

def set_simulator(simulator):
    global _SIMULATOR
    _SIMULATOR = simulator

