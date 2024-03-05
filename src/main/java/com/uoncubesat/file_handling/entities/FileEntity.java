package com.uoncubesat.file_handling.entities;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;

public class FileEntity {
    private String path;

    private String name;

    private byte[] contents;

    public FileEntity(String path, String name) {
        this.path = path;
        this.name = name;
    }

    public FileEntity() {
    }

    public byte[] getContents() {
        return contents;
    }

    public void setContents(byte[] contents) {
        this.contents = contents;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void save(String location) {
        try (FileOutputStream fileOutputStream = new FileOutputStream(location)) {
            if (this.contents != null)
                fileOutputStream.write(this.contents);
        } catch (IOException e) {
            System.err.println("Error writing to file: " + e);
        }

    }

    public void loadContents() {
        File sourceDir = getTruePath();
        File file = new File(sourceDir, this.name);
        System.out.println("Path is " + file.toPath().toAbsolutePath());
        if (file.isDirectory())
            throw new RuntimeException("Path is directory");
        try {
            this.contents = Files.readAllBytes(file.toPath());
        } catch (IOException e) {
            throw new RuntimeException(
                    "Error loading contents for file : " + file.toPath().toAbsolutePath() + " . Exception is " + e);
        }
    }

    public File getTruePath(){
        /**
         * When this function is called by yamcs-instance, the root
         * path is ../yamcs-instance/target/yamcs/ instead of
         * ../yamcs-instance/ , so we need to parse the latter.
         */
        File currentDir = new File(".").getAbsoluteFile().getParentFile();
        File grandParentDir = currentDir.getParentFile().getParentFile();
        return new File(grandParentDir,this.path);
    }
}
