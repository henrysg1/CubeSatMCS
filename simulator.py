import binascii
import io
import socket
import random
import sys
from struct import unpack_from
from threading import Thread
from time import sleep

from command_interpreter import hex_to_command, send_telemetry

HOST = "localhost"

def send_tm(simulator):

    """
    This function reads the packets from the specified .raw
    file and sends them simultaneously to all data links. If
    SEQUENTIAL_SENDING is set to true, then each packet is sent
    to a different Data Link.
    """

    send_telemetry(simulator)


def receive_tc(simulator):
    """
    Listens to YAMCS TCP port and prints in the terminal the received command.
    """

    host = "localhost"
    portTC = 10025
    tc_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tc_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    tc_socket.bind((host, portTC))
    tc_socket.listen(1)
    print("server "+str(portTC)+" listening")
    clientconnTC, _ = tc_socket.accept()
    while True:
        data, _ = clientconnTC.recvfrom(4096)
        simulator.last_tc = data
        if data != b"":
            print(hex_to_command(binascii.hexlify(data).decode("ascii")))
            simulator.tc_counter += 1


class Simulator:
    def __init__(self):
        self.tm_counter = 0
        self.tc_counter = 0
        self.tm_thread = None
        self.tc_thread = None
        self.last_tc = None

    def start(self):
        self.tm_thread = Thread(target=send_tm, args=(self,))
        self.tm_thread.daemon = True
        self.tm_thread.start()
        self.tc_thread = Thread(target=receive_tc, args=(self,))
        self.tc_thread.daemon = True
        self.tc_thread.start()

    def print_status(self):
        cmdhex: str = ""
        if self.last_tc:
            cmdhex = binascii.hexlify(self.last_tc).decode("ascii")
        return "Sent: {} packets. Received: {} commands. Last command {}".format(
            self.tm_counter, self.tc_counter, cmdhex
        )


if __name__ == "__main__":
    simulator = Simulator()
    simulator.start()

    try:
        prev_status = None
        while True:
            status = simulator.print_status()
            if status != prev_status:
                sys.stdout.write("\r")
                sys.stdout.write(status)
                sys.stdout.flush()
                prev_status = status
            sleep(0.5)
    except KeyboardInterrupt:
        sys.stdout.write("\n")
        sys.stdout.flush()
