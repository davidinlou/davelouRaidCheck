# davelouRaidCheck
CotG raid report check

This script scans your raid reports to extract raids with less than 100% carry, then presents you with a list of cities that need raids resetting.

To Use:

1.  Go to Overviews - Raid Reports - Reports.  At the bottom of the screen you'll see:
      Hours to Scan:  How far back to scan.  Default 5 hours.
      Threshold (%):  What percentage carry you want to check for.  Default 100%.
      Scan:  Scan the reports and extract the name of the cities where raids need to be reset.
  
2.  Back in game - The DLCheck button is at the bottom of the screen next to the date/time.
    The window shows you a list of cities.  Click on the city name to go to city where you
    can reset the raids.
    
Notes:
1.  Your city names must be unique and not contain spaces
2.  Requires Tampermonkey to run

To install:

1.  Download script and load it into any editor.  Then Select All and Copy
2.  In TamperMonkey, create a new script (+ sign on dashboard) and delete generated text.
3.  Paste previously copied script and then File - Save.
