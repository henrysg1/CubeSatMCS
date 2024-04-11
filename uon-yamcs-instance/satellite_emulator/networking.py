import socket
import time

from satellite_emulator.config import HOST, CLIENT_CONN_OBC, CLIENT_CONN_ADCS, get_simulator, set_simulator
from satellite_emulator.data_processing import split_data_into_chunks, create_ccsds_header, create_tm_secondary_header, combine_packet_information

def initialize_sockets():
    
    global CLIENT_CONN_OBC, CLIENT_CONN_ADCS

    try:
        portOBC = 10015
        tm_socket_OBC = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        tm_socket_OBC.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        tm_socket_OBC.bind((HOST, portOBC))
        tm_socket_OBC.listen(1)
        print(f"\nServer {portOBC} listening")

        portADCS = 10016
        tm_socket_ADCS = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        tm_socket_ADCS.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        tm_socket_ADCS.bind((HOST, portADCS))
        tm_socket_ADCS.listen(1)
        print(f"Server {portADCS} listening")

        CLIENT_CONN_OBC, _ = tm_socket_OBC.accept()
        CLIENT_CONN_ADCS, _ = tm_socket_ADCS.accept()

    except Exception as e:
        print("Failed to initialize sockets:", str(e))
        raise

def send_packet(data):
    global CLIENT_CONN_OBC, CLIENT_CONN_ADCS
    data_chunks = split_data_into_chunks(data)
    total_chunks = len(data_chunks)
    packet_number = 0

    for i, chunk in enumerate(data_chunks):
        # Set default sequence_flags for a single packet or adjust for multiple
        if total_chunks == 1:  # Only one packet
            sequence_flags = '11'
        elif i == 0:  # First packet in a sequence
            sequence_flags = '01'
        elif i == total_chunks - 1:  # Last packet in a sequence
            sequence_flags = '10'
        else:  # Intermediate packet
            sequence_flags = '00'

        packet_name_ccsds = format(packet_number, '014b')
        packet_name_secondary = format(packet_number, '016b')
        tm_secondary_header = create_tm_secondary_header(3, 25, packet_name_secondary)
        ccsds_header = create_ccsds_header(chunk, tm_secondary_header, sequence_flags, packet_name_ccsds)
        packet = combine_packet_information(ccsds_header, tm_secondary_header, chunk)

        try:
            if CLIENT_CONN_OBC:
                CLIENT_CONN_OBC.send(packet)
            if CLIENT_CONN_ADCS:
                CLIENT_CONN_ADCS.send(packet)
            simulator = get_simulator()
            simulator.tm_counter += 1
            set_simulator(simulator)
        except (BrokenPipeError, ConnectionResetError) as e:
            print("Connection lost. Attempting to reconnect...")
            CLIENT_CONN_OBC = None  # Reset connection
            CLIENT_CONN_ADCS = None  # Reset connection
            reconnect()

        packet_number += 1

def reconnect():

    global CLIENT_CONN_OBC, CLIENT_CONN_ADCS

    while CLIENT_CONN_OBC is None or CLIENT_CONN_ADCS is None:
        try:
            initialize_sockets()  # Attempt to reinitialize connections
            print("Reconnected to the server.")
        except socket.error as e:
            print("Connection failed. Retrying in 5 seconds...")
            time.sleep(5)