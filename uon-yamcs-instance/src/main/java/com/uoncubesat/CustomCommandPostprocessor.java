package com.uoncubesat;

import java.util.Map;

import org.yamcs.YConfiguration;
import org.yamcs.cmdhistory.CommandHistoryPublisher;
import org.yamcs.commanding.PreparedCommand;
import org.yamcs.tctm.CcsdsSeqCountFiller;
import org.yamcs.tctm.CommandPostprocessor;
import org.yamcs.utils.ByteArrayUtils;

import com.uoncubesat.file_handling.network.out.TCParser;

/**
 * Component capable of modifying command binary before passing it to the link for further dispatch.
 * <p>
 * A single instance of this class is created, scoped to the link udp-out.
 * <p>
 * This is specified in the configuration file yamcs.UoNCubeSat.yaml:
 * 
 * <pre>
 * ...
 * dataLinks:
 *   - name: udp-out
 *     class: org.yamcs.tctm.UdpTcDataLink
 *     stream: tc_realtime
 *     host: localhost
 *     port: 10025
 *     commandPostprocessorClassName: com.UoNCubeSat.CustomCommandPostprocessor
 * ...
 * </pre>
 */
public class CustomCommandPostprocessor implements CommandPostprocessor {

    private CcsdsSeqCountFiller seqFiller = new CcsdsSeqCountFiller();
    private CommandHistoryPublisher commandHistory;

    private final TCParser tcparcer = new TCParser();

    // Constructor used when this postprocessor is used without YAML configuration
    public CustomCommandPostprocessor(String yamcsInstance) {
        this(yamcsInstance, YConfiguration.emptyConfig());
    }

    // Constructor used when this postprocessor is used with YAML configuration
    // (commandPostprocessorClassArgs)
    public CustomCommandPostprocessor(String yamcsInstance, YConfiguration config) {
    }

    // Called by Yamcs during initialization
    @Override
    public void setCommandHistoryPublisher(CommandHistoryPublisher commandHistory) {
        this.commandHistory = commandHistory;
    }

    // Called by Yamcs *after* a command was submitted, but *before* the link handles it.
    // This method must return the (possibly modified) packet binary.
    @Override
    public byte[] process(PreparedCommand pc) {
        byte[] binary = pc.getBinary();
        String radioType = System.getenv("RADIO_TYPE");

        int serviceType = binary[7];
        int messageType = binary[8];

        // Set CCSDS sequence count
        int seqCount = seqFiller.fill(binary);

        if ("/yamcs/cfdp/upload".equals(pc.getCmdName())) {
            binary = processCfdpCommand(binary);
        }

        if (serviceType == 23 && messageType == 14) {
            Map<String,String> paths = tcparcer.parseFileCopyPacket(binary);
            tcparcer.processPaths(paths);
        }

        if ("lithium2".equals(radioType)) {
            binary = processRegularCommand(binary);
        }
        
        // Publish the sequence count and updated binary to Command History
        commandHistory.publish(pc.getCommandId(), "ccsds-seqcount", seqCount);
        commandHistory.publish(pc.getCommandId(), PreparedCommand.CNAME_BINARY, binary);
        
        return binary;

    }

    private byte[] processCfdpCommand(byte[] binary) {

        // Construct CCSDS header
        byte[] ccsdsHeader = new byte[6];
        // Packet Version (3 bits), Packet Type (1 bit), Secondary Header Flag (1 bit), APID (11 bits)
        ccsdsHeader[0] = (byte) 0b00011000; // First 8 bits: 000 (version), 1 (type), 1 (secondary header flag), 000 (APID start)
        ccsdsHeader[1] = (byte) 0b00100100; // Next 8 bits: last 8 bits of APID (0100100)
        // Sequence Flags (2 bits), Packet Name (14 bits)
        ccsdsHeader[2] = (byte) 0xC0; // 11 (sequence flags) followed by first 6 bits of packet name
        ccsdsHeader[3] = 0; // Next 8 bits of packet name
        ccsdsHeader[4] = 0; // Last 8 bits of packet name
        // Packet Data Length (16 bits)
        ByteArrayUtils.encodeUnsignedShort(binary.length + 1, binary, 4);

        // Combine CCSDS header, command binary, and any existing wrapping bytes
        byte[] combinedBinary = new byte[ccsdsHeader.length + binary.length];
        System.arraycopy(ccsdsHeader, 0, combinedBinary, 0, ccsdsHeader.length);
        System.arraycopy(binary, 0, combinedBinary, ccsdsHeader.length, binary.length);

        return combinedBinary;
    }

    private byte[] processRegularCommand(byte[] binary) {
        // Update the packet length in the CCSDS header
        ByteArrayUtils.encodeUnsignedShort(binary.length - 7, binary, 4);

        // Calculate lengths and create new array for modified binary
        int headerLength = 6; // 0x4865 (2 bytes) + 0x1003 (2 bytes) + binary.length (2 bytes) 
        int footerLength = 2; // payload_checksum (2 bytes)
        int newLength = headerLength + binary.length + footerLength + 2; // + 2 bytes for header checksum
        byte[] modifiedBinary = new byte[newLength];

        // Construct the header
        modifiedBinary[0] = (byte) 0x48;
        modifiedBinary[1] = (byte) 0x65;
        modifiedBinary[2] = (byte) 0x10;
        modifiedBinary[3] = (byte) 0x03;
        modifiedBinary[4] = (byte) ((binary.length >> 8) & 0xFF); // High byte of binary.length
        modifiedBinary[5] = (byte) (binary.length & 0xFF); // Low byte of binary.length

        // Calculate header checksum
        byte[] headerForChecksum = new byte[headerLength];
        System.arraycopy(modifiedBinary, 0, headerForChecksum, 0, headerLength);
        byte[] headerChecksum = calculateChecksum(headerForChecksum);

        // Append header checksum
        modifiedBinary[6] = headerChecksum[0];
        modifiedBinary[7] = headerChecksum[1];

        // Copy binary data
        System.arraycopy(binary, 0, modifiedBinary, 8, binary.length);

        // Calculate payload checksum
        byte[] payloadChecksum = calculateChecksum(binary);

        // Append payload checksum
        modifiedBinary[newLength - 2] = payloadChecksum[0];
        modifiedBinary[newLength - 1] = payloadChecksum[1];

        return modifiedBinary;
    }

    private byte[] calculateChecksum(byte[] data) {
        int CK_A = 0; // Use int to handle unsigned byte operations
        int CK_B = 0;
        for (byte b : data) {
            CK_A = (CK_A + (b & 0xFF)) % 255;
            CK_B = (CK_B + CK_A) % 255;
        }
        return new byte[]{(byte)CK_A, (byte)CK_B};
    }
    
}
