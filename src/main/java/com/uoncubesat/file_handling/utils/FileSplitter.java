package com.uoncubesat.file_handling.utils;

import com.uoncubesat.file_handling.entities.ChunkedFileEntity;
import com.uoncubesat.file_handling.entities.FileEntity;

import java.util.ArrayList;
import java.util.Arrays;

public class FileSplitter {
    private static final int CHUNK_SIZE_BYTES = 4096;

    /**
     * @param fileEntity : The local file entity to be split into chunks.
     * @return chunkedFileEntity: The same file with its contents split in a List
     */
    public ChunkedFileEntity splitFileInChunks(FileEntity fileEntity) {
        ChunkedFileEntity chunkedFileEntity = new ChunkedFileEntity();
        chunkedFileEntity.setName(fileEntity.getName());
        chunkedFileEntity.setPath(fileEntity.getPath());

        byte[] contents = fileEntity.getContents();
        int numberOfChunks = contents.length / CHUNK_SIZE_BYTES + 1;
        int chunkSize = Math.min(contents.length, CHUNK_SIZE_BYTES);

        ArrayList<byte[]> chunks = new ArrayList<>();
        for (int chunk = 0; chunk < numberOfChunks - 1; chunk++)
            chunks.add(Arrays.copyOfRange(contents, chunk * chunkSize, (chunk + 1) * chunkSize));

        // Add last chunk manually to prevent zero padding
        chunks.add(Arrays.copyOfRange(contents, (numberOfChunks - 1) * chunkSize, contents.length));

        chunkedFileEntity.setChunkSize(chunkSize);
        chunkedFileEntity.setChunks(chunks);
        return chunkedFileEntity;

    }
}
