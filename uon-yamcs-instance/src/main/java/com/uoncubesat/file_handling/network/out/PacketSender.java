package com.uoncubesat.file_handling.network.out;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.logging.Logger;

import com.google.common.primitives.Bytes;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.uoncubesat.file_handling.entities.ChunkedFileEntity;
import io.netty.handler.codec.http.HttpResponseStatus;

public class PacketSender {
    private static final Logger LOGGER = Logger.getLogger(PacketSender.class.getName());

    public static final int THRESHOLD_BYTES = 32000;

    private static final char[] HEX_ARRAY = "0123456789ABCDEF".toCharArray();

    /**
     * Sends a file split in chunks using one or more packets.
     *
     * @param chunkedFileEntity : the split file to be sent.
     */
    public void sentPacketSegments(ChunkedFileEntity chunkedFileEntity) {

        HttpClient client = HttpClient.newHttpClient();

        List<byte[]> chunks = chunkedFileEntity.getChunks();

        int offset = 0;

        do {
            JsonObject mainBody = new JsonObject();
            mainBody.addProperty("base", chunkedFileEntity.getName());
            offset = putChunksIntoPacket(chunks, mainBody, offset);

            JsonObject args = new JsonObject();
            args.add("args", mainBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "http://localhost:8090/api/processors/AcubeSAT/realtime/commands/file-handling/TC(6,1)_load_object_memory_data"))
                    .POST(HttpRequest.BodyPublishers.ofString(args.toString()))
                    .build();

            try {
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() != HttpResponseStatus.OK.code())
                    LOGGER.info(response.body());
            } catch (Exception e) {
                LOGGER.info("Error sending request ");
            }
        } while (offset < chunks.size() - 1);

    }

    /**
     * Places the chunks into groups smaller than the maximum CCSDS packet limit.
     *
     * @param data:            The chunks of the file to be transmitted.
     * @param mainbody:        The Json element that will be the body of the HTTP Request.
     * @param startChunkIndex: The first chunk to be included.
     * @return the starting index for the next packet.
     */
    private int putChunksIntoPacket(List<byte[]> data, JsonObject mainbody, int startChunkIndex) {

        int messageSize = 0;
        int lastChunkIndex = 0;
        int byteOffset = startChunkIndex * data.get(0).length;

        JsonArray memoryData = new JsonArray();

        for (int chunk = startChunkIndex; chunk < data.size(); chunk++) {
            byte[] currentChunk = data.get(chunk);
            int chunkLength = currentChunk.length;

            byte[] information = {(byte) (byteOffset >> 24), (byte) (byteOffset >> 16),
                    (byte) (byteOffset >> 8), (byte) byteOffset, (byte) (chunkLength >> 8), (byte) chunkLength};
            byteOffset += chunkLength;
            messageSize += chunkLength + information.length;

            if (messageSize <= THRESHOLD_BYTES) {
                lastChunkIndex = chunk;
                LOGGER.info(String.format("Added chunk %d with size %d, offset %d, message size: %d", chunk, chunkLength, byteOffset, messageSize));
                String byteData = bytesToHex(Bytes.concat(information, currentChunk));
                memoryData.add(byteData);
            } else
                break;
        }
        int numberOfObjects = lastChunkIndex + 1 - startChunkIndex;

        LOGGER.info("number_of_objects is " + numberOfObjects);

        mainbody.addProperty("number_of_objects", numberOfObjects);
        mainbody.add("binary_data", memoryData);

        return lastChunkIndex + 1;
    }

    public static String bytesToHex(byte[] bytes) {
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars);
    }

}
