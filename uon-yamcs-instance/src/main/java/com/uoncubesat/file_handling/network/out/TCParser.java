package com.uoncubesat.file_handling.network.out;


import com.uoncubesat.file_handling.entities.FileEntity;
import com.uoncubesat.file_handling.enums.LocalPaths;
import com.uoncubesat.file_handling.utils.FileSplitter;
import com.uoncubesat.file_handling.utils.PacketParser;
import com.uoncubesat.file_handling.enums.PacketType;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import static com.uoncubesat.file_handling.utils.PacketParser.DELIMITER;

public class TCParser {

    private static final String[] names = {"Source path", "Source name", "Target path", "Target name"};

    private static final Logger LOGGER = Logger.getLogger(TCParser.class.getName());

    private static final PacketSender packetSender = new PacketSender();

    private static final PacketParser packetParser = new PacketParser();

    private static final FileSplitter fileSplitter = new FileSplitter();

    /**
     * Parses the source file path/name and target file path/name
     * and saves them into a Map in order to be evaluated.
     *
     * @param packet: a TC[6,1] file copy packet.
     */
    public HashMap<String, String> parseFileCopyPacket(byte[] packet) {
        HashMap<String, String> paths = new HashMap<>();

        byte[] data = packetParser.parseData(packet, PacketType.TC);
        StringBuilder builder = new StringBuilder();
        int valuesCounter = 0;
        for (byte character : data) {
            if (character != DELIMITER)
                builder.append((char) character);
            else {
                paths.put(names[valuesCounter], builder.toString());
                builder = new StringBuilder();
                valuesCounter++;
            }
        }
        return paths;
    }

    /**
     * If the source file is local, then it sends the packet segments
     * using the appropriate commands.
     *
     * @param paths: A map containing the source and target file path and name.
     */
    public void processPaths(Map<String, String> paths) {
        String sourcePath = paths.get("Source path");
        String targetPath = paths.get("Target path");

        if (
                sourcePath.equals(LocalPaths.RESOURCES_PATH.toString())
                        || sourcePath.equals(LocalPaths.IMAGES_PATH.toString())
                        || sourcePath.equals(LocalPaths.FILES_PATH.toString())
        ) {
            FileEntity fileEntity = new FileEntity(sourcePath, paths.get("Source name"));
            fileEntity.loadContents();
            packetSender.sentPacketSegments(fileSplitter.splitFileInChunks(fileEntity));
        } else {
            LOGGER.info("Source path does not exist: " + sourcePath);
        }
        if (targetPath.equals(LocalPaths.RECEIVED_PATH.toString())) {
            LOGGER.info("Target Path exists!");
        } else {
            LOGGER.info("Target path does not exist: " + targetPath);
        }

    }
}
