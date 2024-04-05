package com.uoncubesat;

import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.*;

import org.yamcs.TmPacket;
import org.yamcs.YConfiguration;
import org.yamcs.tctm.AbstractPacketPreprocessor;

import com.uoncubesat.file_handling.network.in.TMParser;

public class MyPacketPreprocessor extends AbstractPacketPreprocessor {
    private static final Logger LOGGER = Logger.getLogger(MyPacketPreprocessor.class.getName());

    private final TMParser listener = new TMParser();
    private final Map<Integer, AtomicInteger> seqCounts = new HashMap<>();

    // Constructor used when this preprocessor is used without YAML configuration
    public MyPacketPreprocessor(String yamcsInstance) {
        this(yamcsInstance, YConfiguration.emptyConfig());
    }

    // Constructor used when this preprocessor is used with YAML configuration
    // (packetPreprocessorClassArgs)
    public MyPacketPreprocessor(String yamcsInstance, YConfiguration config) {
        super(yamcsInstance, config);
    }

    @Override
    public TmPacket process(TmPacket packet) {

        LOGGER.info("In process".toString());

        byte[] bytes = packet.getPacket();

        // Expect at least the length of CCSDS primary and secondary header
        if (bytes.length < 17) {
            eventProducer.sendWarning("SHORT_PACKET",
                    "Short packet received, length: " + bytes.length + "; minimum required length is 17 bytes.");
            // If we return null, the packet is dropped.
            return null;
        }

        // Verify continuity for a given APID based on the CCSDS sequence counter
        int apidseqcount = ByteBuffer.wrap(bytes).getInt(0); // first 4 bytes (0-3)
        int datalength = ByteBuffer.wrap(bytes).getShort(4) + 1; // get 2 bytes (4-5)
        int apid = (apidseqcount >> 16) & 0x07FF; // 11 bits 
        int seqflag = (apidseqcount >> 14) & 0x3; // 2 bits
        int seqcount = (apidseqcount) & 0x3FFF; // 14 bits
        int packversion = (apidseqcount >> 29) & 0x7; // 3 bits
        int secheader = (apidseqcount >> 27) & 0x1; // 1 bit
        int pusversion = ByteBuffer.wrap(bytes).get(6) & 0xF;// 4 bits
        int serviceType = ByteBuffer.wrap(bytes).get(7);    //8 bits
        int messageType = ByteBuffer.wrap(bytes).get(8);    //8 bits
        short messageTypeCounter = ByteBuffer.wrap(bytes).getShort(9); //get 2 bytes (9-10)
        short destinationID = ByteBuffer.wrap(bytes).getShort(11); // get 2 bytes (11-12)
        long time = ByteBuffer.wrap(bytes).getInt(13); // 32 bits. Long to prevent overflow

        AtomicInteger ai = seqCounts.computeIfAbsent(apid, k -> new AtomicInteger());
        int oldseq = ai.getAndSet(seqcount);
        StringBuilder stringBuilder = new StringBuilder();
        String newline = System.getProperty("line.separator");
        stringBuilder.append("New packet received!").append(newline);
        if (seqflag != 3 && ((seqcount - oldseq) & 0x3FFF) != 2) {
            stringBuilder.append("Sequence count jump for APID: ").append(apid).append(" old seq: ").append(oldseq).append(" newseq: ").append(seqcount)
                    .append(newline);
            eventProducer.sendWarning("SEQ_COUNT_JUMP",
                    "Sequence count jump for APID: " + apid + " old seq: " + oldseq + " newseq: " + seqcount);
        }

        if (packversion != 0) {
            stringBuilder.append("Wrong version number. Expected 0 and got ").append(packversion).append(newline);
            eventProducer.sendWarning("PACKET_VERSION_ERROR",
                    "Wrong version number. Expected 0 and got " + packversion);

        }

        if (secheader != 1) {
            stringBuilder.append("Wrong secondary flag. Expected 1 and got ").append(secheader).append(newline);
            eventProducer.sendWarning("SEC_HEADER_FLAG_ERROR",
                    "Wrong secondary flag. Expected 1 and got " + secheader);
        }

        if (datalength != (bytes.length - 6)) {
            stringBuilder.append("Wrong packet data length. Expected ").append(bytes.length - 6).append(" and got ")
                    .append(datalength).append(newline);
            eventProducer.sendWarning("PACKET_LENGTH_ERROR",
                    "Wrong packet data length. Expected " + (bytes.length - 6) + " and got "
                            + datalength);
        }
        stringBuilder.append("Sequence_flag:").append(seqflag).append(newline);
        stringBuilder.append("Sequence_count:").append(seqcount).append(newline);
        stringBuilder.append("APID:").append(apid).append(newline);
        stringBuilder.append("PUS:").append(pusversion).append(newline);
        stringBuilder.append("Secondary_header:").append(secheader).append(newline);
        stringBuilder.append("Buffer:").append(apidseqcount).append(newline);
        stringBuilder.append("Time:").append(time).append(newline);
        stringBuilder.append("ServiceType:").append(serviceType).append(newline);
        stringBuilder.append("MessageType:").append(messageType).append(newline);
        stringBuilder.append("Packet data length:").append(datalength).append(newline);
        stringBuilder.append("----").append(newline);
        LOGGER.info(stringBuilder.toString());
        // Our custom packets don't include a secundary header with time information.
        // Use Yamcs-local time instead.


        // Use the full 32-bits, so that both APID and the count are included.
        // Yamcs uses this attribute to uniquely identify the packet (together with the
        // gentime)
        // packet.setSequenceCount(apidseqcount);
        if(serviceType == 6 && messageType == 4)
            listener.parseFileSegmentPacket(packet.getPacket());
        packet.setGenerationTime(System.currentTimeMillis());

        return packet;

    }

    // Returns the unix timestamp in milliseconds
    long CUCtoUnix(long time) {
        long start = 1577836800; // 1/1/2020 00:00:00 GMT +0200
        return start * 1000 + time * 100;
    }
}