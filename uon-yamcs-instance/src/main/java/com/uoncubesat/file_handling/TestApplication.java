package com.uoncubesat.file_handling;

import com.google.common.primitives.Bytes;
import com.uoncubesat.file_handling.entities.ChunkedFileEntity;
import com.uoncubesat.file_handling.entities.FileEntity;
import com.uoncubesat.file_handling.enums.LocalPaths;
import com.uoncubesat.file_handling.utils.FileSplitter;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.Socket;
import java.util.List;
import java.util.logging.Logger;


import static com.uoncubesat.file_handling.network.out.PacketSender.THRESHOLD_BYTES;

class TestApplication {

    private static final Logger LOGGER = Logger.getLogger(TestApplication.class.getName());

    private static final FileSplitter fileSplitter = new FileSplitter();

    public static void main(String[] args) throws IOException {

        int serverPort = 10015;
        InetAddress host = InetAddress.getByName("stavros-pc");
        Socket socket = new Socket("127.0.0.1",serverPort);

        OutputStream output = socket.getOutputStream();

        FileEntity fileEntity = new FileEntity(LocalPaths.FILES_PATH.toString(), "smallFile.txt");
        fileEntity.loadContents();
        ChunkedFileEntity chunkedFileEntity = fileSplitter.splitFileInChunks(fileEntity);
        List<byte[]> chunks = chunkedFileEntity.getChunks();

        int offset = 0;

        do {

            byte[] finalPacket = {};
            offset = putChunksIntoPacket(chunks, finalPacket, offset, output);

        } while (offset < chunks.size() - 1);

    }


    /**
     * Places the chunks into groups smaller than the maximum CCSDS packet limit.
     *
     * @param data:            The chunks of the file to be transmitted.
     * @param startChunkIndex: The first chunk to be included.
     * @return the starting index for the next packet.
     */
    private static int putChunksIntoPacket(List<byte[]> data, byte[] finalPacket, int startChunkIndex, OutputStream output) throws IOException {

        int messageSize = 0;
        int lastChunkIndex = 0;
        int byteOffset = startChunkIndex * data.get(0).length;
        byte[] byteData = {};

        for (int chunk = startChunkIndex; chunk < data.size(); chunk++) {
            byte[] currentChunk = data.get(chunk);
            int chunkLength = currentChunk.length;

            byte[] information = {(byte) (byteOffset >> 24), (byte) (byteOffset >> 16),
                    (byte) (byteOffset >> 8), (byte) byteOffset, (byte) (chunkLength >> 8), (byte) chunkLength};
            byteOffset += chunkLength;
            messageSize += chunkLength + information.length;

            if (messageSize <= THRESHOLD_BYTES) {
                lastChunkIndex = chunk;
                LOGGER.info("Added chunk " + chunk + " with size " + chunkLength + ", offset " + byteOffset
                        + ", message size: " + messageSize);
                byte[] segment = Bytes.concat(information, currentChunk);
                byteData = Bytes.concat(byteData, segment);
            } else
                break;
        }
        int numberOfObjects = lastChunkIndex + 1 - startChunkIndex;

        LOGGER.info("number_of_objects is " + numberOfObjects);

        byte[] numberOfObjectsArray = {(byte) numberOfObjects};
        finalPacket = Bytes.concat(numberOfObjectsArray, finalPacket);

        long time = System.currentTimeMillis(); // UNIX milliseconds
        time /= 1000; // seconds
        time -= 1640988000; // offset from 1/1/2022

        int size = finalPacket.length + 16;

        byte[] primaryHeader = {8, 1, (byte) 192, 0, (byte) (size >> 8), (byte) (size & 0xFF)};
        byte[] secondaryHeader = {32, 6, 4, 0, 0, 0, 1, (byte) (time >> 24), (byte) (time >> 16), (byte) (time >> 8), (byte) (time & 0xFF)};

        finalPacket = Bytes.concat(primaryHeader, secondaryHeader, finalPacket);

        output.write(finalPacket);
        return lastChunkIndex + 1;
    }

}