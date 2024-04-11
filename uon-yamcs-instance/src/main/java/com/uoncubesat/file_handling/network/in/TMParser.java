package com.uoncubesat.file_handling.network.in;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.logging.Logger;

import com.uoncubesat.file_handling.entities.FileEntity;
import com.uoncubesat.file_handling.enums.LocalPaths;
import com.uoncubesat.file_handling.utils.PacketParser;
import com.uoncubesat.file_handling.enums.PacketType;

import static com.uoncubesat.file_handling.utils.PacketParser.DELIMITER;

public class TMParser {

    private static final Logger LOGGER = Logger.getLogger(TMParser.class.getName());

    private static final PacketParser packetParser = new PacketParser();

    /**
     * Reads the packet and writes the data to the files.
     *
     * @param packet: the TM[6,4] packet containing file segments
     */
    public void parseFileSegmentPacket(byte[] packet) {

        byte[] data = packetParser.parseData(packet, PacketType.TM);

        StringBuilder builder = new StringBuilder();
        int packetOffset = 0;
        for (byte character : data) {
            if (character != DELIMITER) {
                builder.append((char) character);
                packetOffset++;
            } else {
                packetOffset++;
                break;
            }
        }

        String base = builder.toString();
        FileEntity entity = new FileEntity(LocalPaths.RECEIVED_PATH.toString(), base);
        File path = entity.getTruePath();
        if (!path.exists())
            path.mkdir();
        File file = new File(path, base);
        try {
            LOGGER.info(String.format("Trying to create %s", file.toPath().toAbsolutePath().toString()));
            file.createNewFile();
        } catch (IOException e) {
            e.printStackTrace();
        }


        int numberOfObjects = data[packetOffset];
        packetOffset++;

        LOGGER.info(String.format("Data length is %d base is %s offset is %d objects are %d", data.length, base, packetOffset, numberOfObjects));
        for (int object = 0; object < numberOfObjects; object++) {

            ByteBuffer buffer = ByteBuffer.wrap(data);
            int offset = buffer.getInt(packetOffset);
            packetOffset += 4;
            short length = buffer.getShort(packetOffset);
            packetOffset += 2;

            LOGGER.info(String.format("Saving %s bytes to %s", length, base));
            byte[] fileSegment = Arrays.copyOfRange(data, packetOffset, packetOffset + length);

            try (RandomAccessFile writer = new RandomAccessFile(file, "rw")) {
                writer.seek(offset);
                writer.write(fileSegment);

            } catch (Exception e) {
                e.printStackTrace();
            }


            packetOffset += length;
        }
    }

}
