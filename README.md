# Mission Control Software Framework for CubeSats

This repository holds the source code for the Yamcs application, basic web interface and back-end server to run the CubeSat MCS.

The **uon-yamcs-instance** directory contains all files used to run the Yamcs application, including the satellite emulator. This is the main directory, and information about the application can be found in this directory.

The **uon-web-interace** directory contains the files for a React-based web interface, which uses API calls to interface with the running Yamcs application. This development has been paused, as it was decided to focus on the development of the Yamcs application, but it is possible that it could be continued in the future.

The **mcs-server** directory contains code that can be run on the back-end to start all application features in one go. This is how the server is launched for the web page.

A live demo can be seen [here](http://uoncubesatmcs.com). Note that this server may be stopped in the future due to running costs.
