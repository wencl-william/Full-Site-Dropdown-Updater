function siteWideMain() 
{  
   var time1 = new Date();//Starts recoreding of run time
  
  
    //Variables to create unique ids for every dropdown on the page.
    var ids = {collapse:0 , accordion:1};  

    // //pagesto run
    healthDistrict(ids);
    recordingsSchoolBoardDistrict(ids);
    minutesSchoolBoardDistrict(ids);
    policiesDistrict(ids);
  
  //Records run time
  var time2 = new Date()
  var timeElapse = (time2.getTime() - time1.getTime())/1000;
  Logger.log("Elapsed Time: " + timeElapse);
}


function singlePageMain()
{  
   var time1 = new Date();//Starts recoreding of run time
  
  
    //Variables to create unique ids for every dropdown on the page.
    var ids = {collapse:0 , accordion:1};  

    //page to run
    healthDistrict(ids);
    // recordingsSchoolBoardDistrict(ids);
    // minutesSchoolBoardDistrict(ids);
    // policiesDistrict(ids);
  
  //Records run time
  var time2 = new Date()
  var timeElapse = (time2.getTime() - time1.getTime())/1000;
  Logger.log("Elapsed Time: " + timeElapse);
}



function healthDistrict(ids)
{
    //The variables that control where the code reads from and writes too
    const sortOptionSheetId = '1Rn2IiIFFnnXtXoQmb2rgvEoNyGwIkCNu0b8DjPUNFj8'; //Spreadsheet that dictates sort method. If not here will default to alphabetical
    const propertiesId =  "health";
    const filePath = ['District','Health','Health-Live']; //The folder path that houses to the Live folder.
    const javaFillTag = "javaFill"; // The tag that the code fills in on the webpage
    startRead(filePath, propertiesId, javaFillTag, sortOptionSheetId, ids);//Call to start the reading
    //covidHealthDistrict(ids)
}

function policiesDistrict(ids)
{
  //The variables that control where the code reads from and writes too
    const sortOptionSheetId = '1G8O-EGGQkMz_NKHRJtchrE4wlMWNWjT-xmLizIvYjBA'; //Spreadsheet that dictates sort method. If not here will default to alphabetical
    const propertiesId = "policies";
    const filePath = ['District','Policies-Live']; //The folder path that houses to the Live folder.
    const javaFillTag = "javaFill"; // The tag that the code fills in on the webpage
    startRead(filePath, propertiesId, javaFillTag, sortOptionSheetId, ids);//Call to start the reading
}

function recordingsSchoolBoardDistrict(ids)
{
  //The variables that control where the code reads from and writes too
    const sortOptionSheetId = '13eOp3un5QyEGd7CFpy7aKE5WoznGyeE4jfjrfFiyu4E'; //Spreadsheet that dictates sort method. If not here will default to alphabetical
    const propertiesId = "schoolBoardRecordings";
    const filePath = ['District','School Board','Live - Board Recordings']; //The folder path that houses to the Live folder.
    const javaFillTag = "javaFillRecordings"; // The tag that the code fills in on the webpage
    startReadNoCheck(filePath, propertiesId, javaFillTag, sortOptionSheetId, ids);//Call to start the reading
}

function minutesSchoolBoardDistrict(ids)
{
  //The variables that control where the code reads from and writes too
    const sortOptionSheetId = '13eOp3un5QyEGd7CFpy7aKE5WoznGyeE4jfjrfFiyu4E'; //Spreadsheet that dictates sort method. If not here will default to alphabetical
    const propertiesId = "schoolBoardMinutes";
    const filePath = ['District','School Board','Live - Board Minutes']; //The folder path that houses to the Live folder.
    const javaFillTag = "javaFillMinutes"; // The tag that the code fills in on the webpage
    startReadNoCheck(filePath, propertiesId, javaFillTag, sortOptionSheetId, ids);//Call to start the reading
}
