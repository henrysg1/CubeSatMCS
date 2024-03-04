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

    SEQUENTIAL_SENDING = False

    portOBC = 10015
    tm_socket_OBC = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tm_socket_OBC.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    portADCS = 10016
    tm_socket_ADCS = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    tm_socket_ADCS.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # portCAN = 10017
    # tm_socket_CAN = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # tm_socket_CAN.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    tm_socket_OBC.bind((HOST, portOBC))
    tm_socket_OBC.listen(1)
    print("\nserver "+str(portOBC)+" listening")

    tm_socket_ADCS.bind((HOST, portADCS))
    tm_socket_ADCS.listen(1)
    print("server "+str(portADCS)+" listening")

    # tm_socket_CAN.bind((HOST, portCAN))
    # tm_socket_CAN.listen(1)
    # print("server  10017 listening")

    clientconnOBC, _ = tm_socket_OBC.accept()

    clientconnADCS, _ = tm_socket_ADCS.accept()

    # clientconnCAN, _ = tm_socket_CAN.accept()

    packetCounter = 0
    simulator.tm_counter = 0

    # sending 2000 packets
    while packetCounter < 400:
        # with io.open("ecsspackets.raw", "rb") as f:
        #     header = bytearray(6)

        #     while f.readinto(header) == 6:
        #         (len,) = unpack_from(">H", header, 4)
        #         packet = bytearray(len + 7)

        #         f.seek(-6, io.SEEK_CUR)
        #         f.readinto(packet)

        #         if SEQUENTIAL_SENDING:
        #             n = random.randint(0, 2)
        #             # OBC UART
        #             if n == 0:
        #                 clientconnOBC.send(packet)
        #                 simulator.tm_counter += 1
        #             # ADSC UART
        #             elif n == 1:
        #                 clientconnADCS.send(packet)
        #                 simulator.tm_counter += 1
        #             # CAN BUS
        #             else:
        #                 # clientconnCAN.send(packet)
        #                 simulator.tm_counter += 1
        #         else:
        #             clientconnOBC.send(packet)
        #             clientconnADCS.send(packet)
        #             # clientconnCAN.send(packet)
        #             simulator.tm_counter += 1

        #         sleep(1)

        #         packetCounter += 1

        packet = send_telemetry()

        clientconnOBC.send(packet)
        clientconnADCS.send(packet)
        simulator.tm_counter += 1

        packetCounter += 1

        sleep(1)

    clientconnOBC.close()
    clientconnADCS.close()
    # clientconnCAN.close()
    print("communication ended")


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
