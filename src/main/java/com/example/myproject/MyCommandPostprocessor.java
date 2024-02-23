package com.example.myproject;

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
 * This is specified in the configuration file yamcs.myproject.yaml:
 * 
 * <pre>
 * ...
 * dataLinks:
 *   - name: udp-out
 *     class: org.yamcs.tctm.UdpTcDataLink
 *     stream: tc_realtime
 *     host: localhost
 *     port: 10025
 *     commandPostprocessorClassName: com.example.myproject.MyCommandPostprocessor
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

        // Calculate the length of the binary data starting from index 7
        int lengthAfterIndex7 = binary.length - 7;

        // Check if the length is within the unsigned short range
        if (lengthAfterIndex7 < 0 || lengthAfterIndex7 > 65535) {
            throw new IllegalArgumentException("The length of the data after index 7 is out of range");
        }

        // Encode this length into the binary at positions 4 and 5
        ByteArrayUtils.encodeUnsignedShort(lengthAfterIndex7, binary, 4);

        // You can include your existing code here for other modifications if necessary

        // Publish the modified binary in Command History too.
        commandHistory.publish(pc.getCommandId(), PreparedCommand.CNAME_BINARY, binary);

        return binary;
    }
}
