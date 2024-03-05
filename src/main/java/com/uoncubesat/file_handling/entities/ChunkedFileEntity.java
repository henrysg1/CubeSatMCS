package com.uoncubesat.file_handling.entities;

import java.util.List;

public class ChunkedFileEntity {

    private String path;

    private String name;

    private int chunkSize;

    private List<byte[]> chunks;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getChunkSize() {
        return chunkSize;
    }

    public void setChunkSize(int chunkSize) {
        this.chunkSize = chunkSize;
    }

    public List<byte[]> getChunks() {
        return chunks;
    }

    public void setChunks(List<byte[]> chunks) {
        this.chunks = chunks;
    }
}
