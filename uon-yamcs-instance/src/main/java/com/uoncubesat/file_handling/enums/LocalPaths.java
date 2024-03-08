package com.uoncubesat.file_handling.enums;

public enum LocalPaths {
    RESOURCES_PATH("src/main/resources/source"),
    IMAGES_PATH("src/main/resources/source/images"),
    FILES_PATH("src/main/resources/source/files"),
    RECEIVED_PATH("src/main/resources/received");

    private final String value;

    LocalPaths(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return value;
    }
}
