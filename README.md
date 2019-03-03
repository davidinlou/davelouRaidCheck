# davelouRaidCheck
CotG raid report check

This script scans your raid reports to extract raids with less than 100% carry, then presents you with a list of cities which need raids resetting.  Requires TamperMonkey to work.

![alt text](https://raw.githubusercontent.com/davidinlou/davelouRaidCheck/master/dlch.png)


To Use:

1.  Go to Overviews - Raid Reports - Reports.  At the bottom of the screen you'll see:
    - Hours to Scan:  How far back to scan.  Default 5 hours.
    - Threshold (%):  What percentage carry you want to check for.  Default 100%.
    - Scan Button:    Scan the reports and extract the name of the cities where raids need to be reset.
  
2.  Back in game - 
    - The DLCheck button is at the bottom of the screen next to the date/time.
    - The window shows you a list of cities.  
    - Click on the city name to go to city where you can reset the raids.
    
Notes:
1.  Your city names must be unique and not contain " - " (space,dash,space)
2.  Requires Tampermonkey to run because add-on scripts don't work in Overviews
3.  City list may appear under other popup windows
4.  City list will stay in place when you change cities

To install/upgrade:

1.  Install TamperMonkey from Chrome store if you don't have it.
2.  Click on davelouRaidCheck.user.js script
3.  Click on Raw
4.  Tampermonkey will ask if you want to install/upgrade

