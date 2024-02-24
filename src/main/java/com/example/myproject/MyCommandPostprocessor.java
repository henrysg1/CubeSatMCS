package com.uoncubesat;

import org.yamcs.YConfiguration;
import org.yamcs.cmdhistory.CommandHistoryPublisher;
import org.yamcs.commanding.PreparedCommand;
import org.yamcs.tctm.CcsdsSeqCountFiller;
import org.yamcs.tctm.CommandPostprocessor;
import org.yamcs.utils.ByteArrayUtils;

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
 *     commandPostprocessorClassName: com.UoNCubeSat.MyCommandPostprocessor
 * ...
 * </pre>
 */
public class MyCommandPostprocessor implements CommandPostprocessor {

    private CcsdsSeqCountFiller seqFiller = new CcsdsSeqCountFiller();
    private CommandHistoryPublisher commandHistory;

    // Constructor used when this postprocessor is used without YAML configuration
    public MyCommandPostprocessor(String yamcsInstance) {
        this(yamcsInstance, YConfiguration.emptyConfig());
    }

    // Constructor used when this postprocessor is used with YAML configuration
    // (commandPostprocessorClassArgs)
    public MyCommandPostprocessor(String yamcsInstance, YConfiguration config) {
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

        // Update the packet length in the CCSDS header
        ByteArrayUtils.encodeUnsignedShort(binary.length - 7, binary, 4);

        // Set CCSDS sequence count
        int seqCount = seqFiller.fill(binary);

        // Calculate lengths and create new array for modified binary
        int headerLength = 8; // 0x4865 (2 bytes) + 0x1003 (2 bytes) + binary.length (2 bytes) + 2 bytes for header checksum
        int footerLength = 2; // payload_checksum (2 bytes)
        int newLength = headerLength + binary.length + footerLength; // Additional 4 bytes for checksums
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

        // Publish the sequence count and updated binary to Command History
        commandHistory.publish(pc.getCommandId(), "ccsds-seqcount", seqCount);
        commandHistory.publish(pc.getCommandId(), PreparedCommand.CNAME_BINARY, modifiedBinary);

        return modifiedBinary;
    }

    private byte[] calculateChecksum(byte[] data) {
        byte CK_A = 0;
        byte CK_B = 0;
        for (byte b : data) {
            CK_A = (byte) ((CK_A + b) % 255);
            CK_B = (byte) ((CK_B + CK_A) % 255);
        }
        return new byte[]{CK_A, CK_B};
    }
}
