# UoN CubeSat YAMCS Instance

This repository contains the source code of the Yamcs application used to communicate with a satellite with Lithium-2 Radios. To find more information regarding the specific features of this communication as well as the changes made in Yamcs, the thesis associated with this work should be read.

This application contains a **Mission Database** that can process incoming **telemetry** following the Packet Utilisation Standard and send **commands**, which will be interpreted by the included **Satellite Emulator**, provided that the simulation script is running.

This application uses the provided Yamcs web interface. The web interface runs on port 8090 and uses basic YAML security for different account accesses.

## Running YAMCS

The basic information and prerequisites for running Yamcs can be found [Here](https://yamcs.org/getting-started)

To start the main YAMCS instance, run:

    mvn yamcs:run

This will then start the server and web inteface, which can be seen at http://localhost:8090

## Telemetry

To start the **Satellite Emulator** for **TM/TC**, run the simulator script:

    python simulator.py

This script uses TCP to establish a link to the satellite emulator scripts, which emulate the sending and receival of commands and telemetry. By default, the emulator scheduler should send housekeeping data once it has started and the TCP connection is made.

## Telecommanding

The **Mission Database** created in this application contains several CCSDS telecommands. In future, all CCSDS telecommands will need to be added. The structure of these packets complies with the [CCSDS Space Packet Protocol](https://public.ccsds.org/Pubs/133x0b2e1.pdf#page=32) and the [ECSS-E-ST-70-41C](https://ecss.nl/standard/ecss-e-st-70-41c-space-engineering-telemetry-and-telecommand-packet-utilization-15-april-2016/) standards.

Telecommands can be sent through the "Commanding" section on YAMCS web interface.

## Instances 

In the **yamcs.yaml** file (located in yamcs-instance/src/main/yamcs/etc) five instances are currently being loaded when yamcs starts. These are ADCS, COMMS, OBC, JAM and SAIL. Each instance has been configured to meet the requirements of the respective sub-system, with the COMMS instance being used for sending commands to the satellite. The file for each instance's configuration is the **yamcs.subsystemName.yaml**. 

## Data-Links

In each **yamcs.subsystemName.yaml** file (located in yamcs-instance/src/main/yamcs/etc), a data-link has been established for receival of telemetry, and one for the COMMS output. Every time a packet gets sent or received, the count of the respective data-link is increased.

* Telemetry Data-Links 
    * "OBC", receiving data through port 10015.
    * "ADCS", receiving data through port 10016.
    * "COMMS", receiving data through port 10017.
    * "JAM", receiving data through port 10018.
    * "SAIL", receiving data through port 10019.

* Telecommanding Data-Links
    * "tcp-out", which is connected to the COMMS instance and is sending data at port 10025.

For now, simulator.py sends packets to all TM Data-Links. Given that TCP is used, only one port can be used for each link.

## Mission Database

The Mission Database describes the telemetry and commands that are processed by YAMCS. It tells YAMCS how to decode packets or how to encode telecommands. 

The .xml files (located in yamcs-instance/src/main/yamcs/mdb) contain all the information regarding the parameters, the containers and the commands used in AcubeSAT YAMCS Instance.

The mdb is split across multiple folders to ensure readability and maintainability. The folders, as well as their contents are the following: 

- The **subystemName folders** which are split between two xmls: 
    - `subsystemName-dt.xml` --> Contains complex datatypes used by the subsystem.
    - `subsystemName-xtce.xml` --> Contains all of the subsystem's parameters.
- The **common folder** which contains two subfolders: 
    - The **dt folder** which contains **ParameterTypes** and more specifically: 
        - `base-dt.xml` --> Contains primitive datatypes.
        - `dt.xml` --> Contains complex datatypes used by the OBC and ADCS subsystems.
        - `file-handling-dt.xml` --> Contains the datatypes required for the file handling and the image transmission.
        - `ST[01]-dt.xml` --> Contains the enumeration datatypes used in ST[01].
        - `time-based-dt.xml` --> Contains the complex datatypes used in ST[11].
        - `writeable-dt.xml` --> Contains writeable argument datatypes used in ST[20].
    - The **pus folder** which contains: 
        - `pus.xml` --> Contains the headers used to make up the telemetry and the telecommand packets, as well as the necessary parameters that make up the headers. 
- The **frames folder**: 
    - `frames-dt.xml` --> Contains the necessary complex datatypes used in frames.
    - `frames.xml` --> Contains the frame packets, as well as the required parameters to make them up.
- The **services folder**: 
    - `ST[x].xml` --> Contains the parameters and the packets for service ST[x].
    - `Logger.xml` --> Contains a custom telemetry packet used for transporting message logs.

## Connection to Lithium-2 Radio

By default, this application adds additional bytes to each packet, so that it is possible to communicate using the Lithium-2 radio. If it is decided that this does not need to be used, then the addition of bytes can be removed by setting the **LITHIUM_CONNECTED** variable to **False** in satellite_emulator/config.py.