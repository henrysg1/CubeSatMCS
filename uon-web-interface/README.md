## AcubeSAT mission control interface

This application is used to receive and send commands in cooperation with the [YAMCS application](https://gitlab.com/acubesat/ops/yamcs-instance). Its usage also covers showing graphs of all the telemetered variables (live and archived). Future updates will include the abilities to send commands and show multiple live telemetry values. 

## Table of contents

- [Installation](#installation)
- [Running Software](#running software)
- [Application description](#Application description)
  - [Dashboard](#Dashboard Page)
  - [Side navigation bar](#side navigation bar)
    - [Archived Telemetry](#Archived Telemetry)
    - [Real time graphs](#Real time graphs)
    - [Telemetry](#telemetry)
    - [Telecommands](#telecommands)
    - [Buckets](#buckets)
        - [Images](#images)

## Installation

1. To clone the application: 

    ```git clone https://gitlab.com/acubesat/ops/frontend-software.git```
2. To install required dependencies:

    ```npm install```


**General Information**

This project was generated with Angular CLI version 13.0.4.

To install Angular CLI run -> ```npm install -g @angular/cli```.


## Running Software. <a name="running software"></a>

To run the application, type in your terminal `ng serve` or `npm run ng serve`.

The app will open at  `localhost:4200`.

You can also run the application using docker for which you can find specific instructions on our [wiki page](https://gitlab.com/acubesat/ops/frontend-software/-/wikis/Run-app-using-Docker).

## Application description. <a name="Application description"></a>

This section covers a thorough description of the components of the application as well as instructions for the usage of its features. 

Your application consists of two main parts: the dashboard and the side navigation bar. 

### Dashboard <a name="Dashboard Page"></a>

![main_page](/application_screenshots/main_page.png)

Your dashboard is where your graphs and forms will be shown. It also includes some small explanatory paragraphs for a more straight forward navigation through the app. Furthermore, a home and graph button exist to reroute to the refered components.

Here you can also choose the YAMCS instance of the data that you want to display by clicking either of the buttons at the center of the page. The default YAMCS instance is OBC. You can always see the selected instance at the top left corner of the page, highlighted in yellow color.

### Side navigation bar <a name="side navigation bar"></a>

![side navigation bar](/application_screenshots/sidenav.png)

Your navigation bar contains all the functionalities of the application. It encapsules the necessary buttons to create graphs (archived and live) as well the ability to display all the telemetered values of the received parameters. Each of the aformentioned capabilites are described below. 


#### Archived Telemetry <a name="Archived Telemetry"></a>

![archived-telemetry](/application_screenshots/archived-telemetry.png)

The archived telemetry component can be used to show old data samples on a graph. The user can choose the variable, the start and stop time as well as the count which corresponds to the amount of intervals to use. After the selection of these options, the user submits the data as a query and a graph is being displayed.

In order to show Archived Graphs follow the next steps:

1. Open the side navigation bar and press the `Create Archive Graph` button. A stepper will pop up.

2. Choose the File where your telemetry parameter exists and find it either by checking all the parameters or by searching it with the search bar.

3. Choose the start and stop times and the count number for your archived telemetry (do consider that the time is in **Western European Time** or **UTC**). Below the start time field, there is a hint that corresponds to the minimum time you can insert. The same happens for the stop time field with the difference that the hint corresponds to maximum time you can insert. Be **extra careful** choosing them. Wrong range of time and a high number of count (step) will cause issues to the app. 

4. Send the query and press the button to show the graph. Your graph will be displayed on the main page.

5. Press on the appeared graph to open it fully.

#### Real time graphs <a name="Real time graphs"></a>

![graph](/application_screenshots/graph.png)

The real time graph component is used to show the live value of the chosen parameter. The user picks a telemetry parameter from the available graph parameters as shown below and creates a component displaying it's real time value as well as a graph, if possible, depending on the parameter's type. The user is able to choose multiple parameters.

![parameters](/application_screenshots/graph-parameters.png)

In order to open a Real-time Graph:

1. Open the Dashboard and press the `Create Real Time Graph` button.

2. Pick the parameter, from the list, which corresponds to the desired telemetry. Your graph will appear on the screen.

3. Press on the appeared graph to open it fully.

In order to remove a graph, press the red x at the top right corner of the graph.

At the top of the graphs you can find the button that changes the view to the available parameters list in order to create a new graph.



#### Telemetry <a name="telemetry"></a>

![telemetry-table](/application_screenshots/telemetry-table.png)

Pressing the button unveils a table with all the telemetry parameters. Its purpose is to display the real time values of multiple parameters.



#### Telecommands <a name="telecommands"></a>

This functionality allows the operator to send telecommands to the satellite. Pressing the button unveils a table that lets the operator choose which telecommand they want to send. A search bar to filter the telecommands is also present. 

![telecommands-table](/application_screenshots/telecommands-table.png)

The operator is then prompted to fill in the required arguments. Hints and validation are present on all input fields, in order to avoid misinputs and help ensure that all arguments have allowed values. In case any argument is incorrect, the telecommand is not allowed to be sent. Accessing and editing arguments with initial values is also allowed and can be done by pressing the **Toggle Initial Values** button. The following is an example without showing the arguments initial values: 

![command-example](/application_screenshots/command-example.png)

After sending the telecommand, the operator will be prompted to the command's response, which contains information about its generation time, status, assigned arguments, etc.

![command-status](/application_screenshots/command-status.png)

#### Buckets <a name="buckets"></a>

Buckets are used to save and sort our images into various folders (buckets) . We can also create and delete folders as we fit.

![buckets](/application_screenshots/buckets.png)

The Table of the buckets consist the below information:

- Name —> The name of the bucket
- 0bjects —> The number of the images inside the bucket
- Max objects —> The max number of objects that the bucket can contain (default = 100)
- Size —> The size of the total images inside the bucket
- Created —> The date the bucket was created
- Available space —> The space that is free inside the bucket
- Delete —> A button to delete the bucket

##### Images <a name="images"></a>

![images](/application_screenshots/images.png)

Available features 

- Download —> Download the image
- View —> Provide more details of the image

![image](application_screenshots/image.png)
