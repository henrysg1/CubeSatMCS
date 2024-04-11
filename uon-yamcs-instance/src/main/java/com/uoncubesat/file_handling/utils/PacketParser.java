package com.uoncubesat.file_handling.utils;

import com.uoncubesat.file_handling.enums.PacketType;

import java.util.Arrays;

public class PacketParser {

    public static final int DELIMITER = 0;

    private static final int PRIMARY_HEADER_SIZE = 6;

    private static final int SECONDARY_HEADER_TM_SIZE = 11;

    private static final int SECONDARY_HEADER_TC_SIZE = 5;


    /**
     * @param packet: with the following structure:
     *                <p>
     *                primary_header | secondary_header | data
     *                <p>
     *                primary_header: 6 bytes containing various data such
     *                as packet version number, packet type, application id etc
     *                <p>
     *                secondary_header: 5 bytes containing PUS version number (4 bits)
     *                spacecraft time reference status (4 bits), service type id (8 bits),
     *                message type id (8 bits) and message type counter (16 bits).
     * @return the data portion of the packet, discarding the headers.
     */
    public byte[] parseData(byte[] packet, PacketType type) {
        byte[] data;
        switch (type) {
            case TM:{
                data = Arrays.copyOfRange(packet, PRIMARY_HEADER_SIZE +SECONDARY_HEADER_TM_SIZE , packet.length);
            }
            break;
            case TC:{
                data =  Arrays.copyOfRange(packet, PRIMARY_HEADER_SIZE +SECONDARY_HEADER_TC_SIZE, packet.length);
            }
            break;
            default:
                throw new IllegalStateException("Unexpected value: " + type);
        }
        return data;
    }
}

