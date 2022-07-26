/*
 * This is the functions for the code reads in the files under the Live folder
 * for each respective page in the shared subfolder for that page. Each page 
 * has a secondary script that runs the specific functions for it. This can 
 * handle google docs, google sheets, .doc, .docx, .pdf, and links. It then 
 * creates html writes that to a javascript file in this drive. Once set up
 * a webpage can run that javascript to display a file tree of the documents
 * in the live folder. Has separate formats for desktop and mobile.
 * 
 * @author Billy Wencl
 * @contact: wencl.william@isd391.org
 * @version: 4.0
 * @date: 11-15-2020 
 */


/**
 * Starts the read Process, runs 1 time per page
 * @param filePath The folder path to the Live folder.
 * @param propertiesId The file id the code writes too. 
 * @param javaFillTag The tag that the code fills in on the webpage
 * @param sortOptionSheetId Spreadsheet that dictates sort method. If not here will default to alphabetical
 * @param dropIds Variables to create unique ids for every dropdown on the page Format {collapse:## , accordion:##};
 */
function startRead(filePath, propertiesId, javaFillTag, sortOptionSheetId, dropIds)
{ 
    //Searches for parent folder ******************************************Needs Validation Code******************************************************
    var folder = DriveApp.getFoldersByName(filePath[0]).next(); 
    for(var i = 1; i < filePath.length; i++)
    {
        folder = folder.getFoldersByName(filePath[i]).next(); 
    }
    
    var checkFill = [false,'','']; //handles the return from check folder fill
    var topLogicScript;
    var docList;
    var html = ['', ''];

    //Runs the check fill function to determine if there is more than one file, folder, or link
    //Returns a list with a boolean value, true if folder has more than 1 item
    //List is formatted as [bool, htmlCodeForDesktop, htmlCodeForMobile]
    checkFill = checkFolderFill(folder, dropIds, sortOptionSheetId);
  
    if(checkFill[0]){
        //If the folder has multiple files runs the recursive code to create html code for each file
        //The Return is formatted as a list with desktop and mobile html. [htmlCodeForDesktop, htmlCodeForMobile]
        html = readFolders(folder, dropIds, sortOptionSheetId);
    }
    else
    {
        //Sets the html to the returned html from checkFolderFill if there is only one file
        html[0] = checkFill[1];
        html[1] = checkFill[2];
    }

    //This is the Java script that decides whether it is mobile of desktop and displays the returned html code in an
    //Element with the name of: javaFill1234
/*~~~~~THIS IS THE ORIGINAL~~~~~~~~~~~~~~~*/
    // topLogicScript = "if(screen.width < 500){ document.getElementById('" + javaFillTag + "').innerHTML = '" + html[1] + "' } else{" +
    //     "document.getElementById('" + javaFillTag + "').innerHTML = '" + html[0] + "' }; function loadVideoIframe(playingDivId){"+
    //      "var playingDiv = document.getElementById('scriptIn'+playingDivId); if(!playingDiv.classList.contains('playing'))"+
    //     "{ playingDiv.classList.add('playing'); loadIframe('frame'+playingDivId);}}; function loadIframe(frameID) {" +
    //     "var frame = document.getElementById(frameID); frame.src = frame.dataset.src; };"+
    //     "$('.playableVideoDiv').on('hidden.bs.collapse', function () { $(this).find('iframe').attr('src', ''); $(this).removeClass('playing');});"+
    //     "$('.playableAudioDiv').on('hidden.bs.collapse', function () { $(this).find('audio').trigger('pause'); $(this).removeClass('playing');});";
/*~~~~~THIS IS THE ORIGINAL~~~~~~~~~~~~~~~*/
    topLogicScript = "document.getElementById('" + javaFillTag + "').innerHTML = '" + html[1] + "';" +
        "function loadVideoIframe(playingDivId){"+
         "var playingDiv = document.getElementById('scriptIn'+playingDivId); if(!playingDiv.classList.contains('playing'))"+
        "{ playingDiv.classList.add('playing'); loadIframe('frame'+playingDivId);}}; function loadIframe(frameID) {" +
        "var frame = document.getElementById(frameID); frame.src = frame.dataset.src; };"+
        "$('.playableVideoDiv').on('hidden.bs.collapse', function () { $(this).find('iframe').attr('src', ''); $(this).removeClass('playing');});"+
        "$('.playableAudioDiv').on('hidden.bs.collapse', function () { $(this).find('audio').trigger('pause'); $(this).removeClass('playing');});";

  
    // //This searches for and verifies that the file to write the script to exists and then writes the html
    // //Over whatever is in that file
    //docList = DriveApp.getFileById(propertiesId);
    //docList.setContent(topLogicScript);
    ScriptProperties.setProperty(propertiesId, topLogicScript);
}


/**
 * Reads over the folder and sub folders recursivly to process the files and 
 * Folders. It then calls a sort and creates the htmlcode for mobile and desktop 
 * for the items in sorted order.
 * 
 * @param parentFolder - A google script folder object to loop through
 * @param ids- an object containing the reference to the collapse and accordion ids
 * @param sortOptionSheetId Spreadsheet that dictates sort method. If not here will default to alphabetical
 * 
 * @return A list containing two strings: the first is the html code for desktop, the second is the html code for mobile
 */
function readFolders(parentFolder, ids, sortOptionSheetId) {
    var file; //Individual file data is stored in this.
    var parentFiles; //A list of files in a folder is stored in this
    var childFolder; //Individual folder data is stored in this.
    var name; //Name of a file is stored in this
    var nameCheck; //variable to hold the index of characters that are being removed from a name
    var htmlDesktopFolder; //Holds html for the folder level of dropdowns
    var htmlMobileFolder; //Holds html for the folder level of dropdowns
    var important = false; //bool used to mark if a file has been marked as important
    var importantList = []; //The list of folders, files, or links that are marked to be kept at the top
    var sortList = []; //The list of the rest of the folders, files, or links 
    var htmlList = ['', '']; //handles the return list from recursive calls to this function for sub folders
    var checkFill = [false,'','']; //handles the return from check folder fill

    // Used to fill html that is the same between desktop and mobile
    // html code on this line is the start of a group of dropdowns that close if another is open
    var htmlFill = '<div class="panel-group" id="accordion' + ids.accordion + '">' 
    var htmlDesktop = htmlFill;
    var htmlMobile = htmlFill;
    
    //Gets a list of folders in the parent folder
    var children = parentFolder.getFolders();

    //Loops through the subfolders and recursively calling the readFolders function for each, and generating the new folder code
    while (children.hasNext()) {
        //Empties variables
        htmlDesktopFolder = "";
        htmlMobileFolder = "";
        htmlList = ['', ''];
        important = false;

        childFolder = children.next(); //Gets the next folder in the list
        name = childFolder.getName(); //Gets the name of the folder
        
        //Verify there are no ' in the folder name. Remove them if there are.
        nameCheck = childFolder.getName().indexOf("'");
        while (nameCheck != -1) {
            name = childFolder.getName().replace("'", "")
            nameCheck = name.indexOf("'");
            childFolder.setName(name);
        }
      

        //Checks if the folder has been marked with an * as the first character
        if(childFolder.getName().indexOf("*") == 0)
        {
            //Marks the folder as important and removes the asterisk from the name string so it doesn't display
            //Does NOT change folder name here
            important = true;
            name = name.substring(1);
        }
        
        ids.collapse++; //Increments the Unique ID

        //Creates the Html Code to start the folder drop down
        htmlFill = '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">' +
            '<a class="collapsible-item-title-link-icon pull-right" data-toggle="collapse" data-parent="#accordion' + ids.accordion +
            '" href="#collapse' + ids.collapse + '" role="button"><span class="glyphicon glyphicon-chevron-down"></span></a>' +
            '<a data-parent="#accordion' + ids.accordion + '" data-toggle="collapse" href="#collapse' + ids.collapse + '" class="dropDown">' +
            name + '</a></h4></div><div class="collapse panel-collapse" id="collapse' + ids.collapse + '">' +
            '<div class="panel-body dpdwnPB">'
        htmlDesktopFolder += htmlFill; 
        htmlMobileFolder += htmlFill;
      
       
        ids.accordion++; //increments the level for the folders contents
        //Runs the check fill function to determine if there is more than one file, folder, or link
        //Returns a list with a boolean value, true if folder has more than 1 item
        //List is formatted as [bool, htmlCodeForDesktop, htmlCodeForMobile]
        checkFill = checkFolderFill(childFolder, ids, sortOptionSheetId);
 
        if(checkFill[0]){
            //If the folder has multiple files runs the recursive code to create html code for each file
            htmlList = readFolders(childFolder, ids, sortOptionSheetId); //recursively calls this function on the folders contents
            htmlDesktopFolder += htmlList[0]; //adds the code for the folder contents to its body
            htmlMobileFolder += htmlList[1]; //adds the code for the folder contents to its body
        }
        else
        {  
            //Sets the html to the returned html from checkFolderFill if there is only one file
            htmlDesktopFolder += checkFill[1]; //adds the code for the folder contents to its body
            htmlMobileFolder += checkFill[2]; //adds the code for the folder contents to its body
        }
        ids.accordion--;
        htmlFill = '</div></div></div>'; //Ends the folder's body code
        htmlDesktopFolder += htmlFill;
        htmlMobileFolder += htmlFill;

        //If the folder was marked as important adds it to the important list for sorting
        if(important){
            //This adds an object with the folder information to the list. It allows sorting 
            //by many methods and contains the html code to put together after sorting
            importantList.push({ name: name, dateUpdated: childFolder.getLastUpdated(), dateCreated: childFolder.getDateCreated(), htmlDesktop: htmlDesktopFolder, htmlMobile: htmlMobileFolder })
        }
        else  //If the folder was NOT marked as important it adds it to the normal list for sorting
        {
            //This adds an object with the folder information to the list. It allows sorting 
            //by many methods and contains the html code to put together after sorting
            sortList.push({ name: name, dateUpdated: childFolder.getLastUpdated(), dateCreated: childFolder.getDateCreated(), htmlDesktop: htmlDesktopFolder, htmlMobile: htmlMobileFolder })
        }
    }
    //Now the folder loop is over and all the subfolders have been processed   


    parentFiles = parentFolder.getFiles();//Gets a list of files in the parent folder

    //Loops over each file in the folder generating the html code for it
    while (parentFiles.hasNext()) {
        htmlList = ['', '']//Empty list
        important = false;//Resets important
        ids.collapse++;//Increments the Unique ID

        file = parentFiles.next();//Gets the next file in the list

        //Logger.log(file.getMimeType());
        //Checks if the current file is the designated spreadsheet with links to display
        if(file.getName() == "Links" && file.getMimeType() == 'application/vnd.google-apps.spreadsheet')
        {
            var lists = [[],[]] //Creates a list of Lists for the return from processLinks

            lists = processLinks(file, importantList, sortList); //Calls processLinks with the existing lists to be added to
            importantList = lists[0]; //sets importantList to the list processLinks added to
            sortList = lists[1]; //sets sortList to the list processLinks added to
            continue; //Skips to the next iteration of the loop
        }

        //Verify there are no ' in the file name. Remove them if there are.
        nameCheck = file.getName().indexOf("'");
        while (nameCheck != -1) {
            name = file.getName().replace("'", "")
            nameCheck = name.indexOf("'");
            file.setName(name);
        }

        //Verifies the .pdf file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.pdf');
        while (nameCheck != -1) {
            name = file.getName().replace('.pdf', '')
            nameCheck = name.indexOf('.pdf');
            file.setName(name);
        }

      
       //Verifies the .mp4 file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.mp4');
        while (nameCheck != -1) {
            name = file.getName().replace('.mp4', '')
            nameCheck = name.indexOf('.mp4');
            file.setName(name);
        }
        //Verifies the .mp4 file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.mov');
        while (nameCheck != -1) {
            name = file.getName().replace('.mov', '')
            nameCheck = name.indexOf('.mov');
            file.setName(name);
        }
        //Verifies the .mp4 file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.avi');
        while (nameCheck != -1) {
            name = file.getName().replace('.avi', '')
            nameCheck = name.indexOf('.avi');
            file.setName(name);
        }
      
      //Verifies the .pdf file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.mp3');
        while (nameCheck != -1) {
            name = file.getName().replace('.mp3', '')
            nameCheck = name.indexOf('.mp3');
            file.setName(name);
        }
      //Verifies the .pdf file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.MP3');
        while (nameCheck != -1) {
            name = file.getName().replace('.MP3', '')
            nameCheck = name.indexOf('.MP3');
            file.setName(name);
        }
      //Verifies the .pdf file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.wav');
        while (nameCheck != -1) {
            name = file.getName().replace('.wav', '')
            nameCheck = name.indexOf('.wav');
            file.setName(name);
        }
      
        //Verifies the .docx file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.docx');
        while (nameCheck != -1) {
            name = file.getName().replace('.docx', '')
            nameCheck = name.indexOf('.docx');
            file.setName(name);
        }

        //Verifies the .doc file extension isn't in the name, removes it if it is
        nameCheck = file.getName().indexOf('.doc');
        while (nameCheck != -1) {
            name = file.getName().replace('.doc', '')
            nameCheck = name.indexOf('.doc');
            file.setName(name);
        }
      
        //Checks if the file has been marked with an * as the first character
        if(file.getName().indexOf("*") == 0)
        {
            //Marks the file as important and removes the asterisk from the name of it so it doesn't display
            //ACTUALLY changes the file name here
            important = true;
            file.setName(file.getName().substring(1));
        }

        //Sorts Files by type. Only recognizes: pdf, .doc, .docx, google doc, and google spreadsheet
        if (file.getMimeType() == 'application/pdf') {
            //Calls the function to write the code for a pdf
            htmlList = dropDownPdf(file, ids);

            //If the file was marked as important adds it to the important list for sorting
            if(important){
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                importantList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }
            else
            {
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                sortList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }
        }
        else if (file.getMimeType() == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  file.getMimeType() == 'application/msword' ||
                  file.getMimeType() == 'application/vnd.google-apps.document') 
        {
            //Calls the code to make the html for a doc, docx, or google doc
            htmlList = dropDownDoc(file, ids);

            //If the file was marked as important adds it to the important list for sorting
            if(important){
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                importantList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }
            else
            {
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                sortList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }        
        }
        else if (file.getMimeType() == 'video/mp4'|| file.getMimeType() == 'video/x-msvideo'||file.getMimeType() =='video/msvideo'||
                 file.getMimeType() =='video/avi'||file.getMimeType() =='video/avi' || file.getMimeType() == 'video/quicktime' || 
                 file.getMimeType() == 'application/x-troff-msvideo') 
        {
            //Calls the code to make the html for a doc, docx, or google doc
            htmlList = dropDownVideo(file,ids);

            //If the file was marked as important adds it to the important list for sorting
            if(important){
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                importantList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }
            else
            {
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                sortList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }        
        }
        else if (file.getMimeType() == 'audio/x-mpeg-3' || file.getMimeType() == 'audio/mpeg3'||file.getMimeType() == 'audio/mpeg' || 
                 file.getMimeType() == 'video/x-mpeg'|| file.getMimeType() == 'video/mpeg' ||
                 file.getMimeType() == 'audio/x-wav' || file.getMimeType() == 'audio/wav') 
        {
            //Calls the code to make the html for a doc, docx, or google doc
            htmlList = dropDownAudio(file,ids);

            //If the file was marked as important adds it to the important list for sorting
            if(important){
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                importantList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }
            else
            {
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                sortList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }        
        }
        else if (file.getMimeType() == 'application/vnd.google-apps.spreadsheet') {
            //Calls the code to make the html for a googleSheet
            htmlList = dropDownSheet(file, ids);

            //If the file was marked as important adds it to the important list for sorting
            if(important){
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                importantList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }
            else
            {
                //This adds an object with the file information to the list. It allows sorting 
                //by many methods and contains the html code to put together after sorting
                sortList.push({ name: file.getName(), dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlList[0], htmlMobile: htmlList[1] })
            }       
        }

        //If the file was marked as important it readds the asterisk to its name
        if(important){ file.setName('*'+file.getName());}
        
    }

    //Calls the sort function on the two lists of files, folders, and links
    importantList = selectedSort(importantList, sortOptionSheetId);
    sortList = selectedSort(sortList, sortOptionSheetId);
  
    //Adds first the important list, then the normal list's html object by object
    for (var i = 0; i < importantList.length; i++) {
        //Calls the object at index i's html code and adds it to the main code
        htmlDesktop += importantList[i].htmlDesktop;
        htmlMobile += importantList[i].htmlMobile;
    }
    for (var i = 0; i < sortList.length; i++) {
        //Calls the object at index i's html code and adds it to the main code
        htmlDesktop += sortList[i].htmlDesktop;
        htmlMobile += sortList[i].htmlMobile;
    }

    //Ends the collapse level div
    htmlDesktop += '</div>';
    htmlMobile += '</div>';

    //returns the mobile and desktop code in a list
    return [htmlDesktop, htmlMobile];
}


/**
 * Generates the html code for a word document drop down.
 *
 * @param file - the google script file object to make html for
 * @param ids- an object containing the reference to the collapse and accordion ids
 * 
 * @return The Html code for the give file
 */
function dropDownDoc(file, ids) {
    var htmlDesktop = '<div class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title"><span onclick="loadIframe(&apos;frame' + ids.collapse + '&apos;)">' +
        '<a class="collapsible-item-title-link-icon pull-right" data-parent="#accordion' + ids.accordion + '" data-toggle="collapse" href="#collapse' +
        ids.collapse + '" role="button"> <span class="glyphicon glyphicon-chevron-down"></span> </a>' +
        '<a data-parent="#accordion' + ids.accordion + '" data-toggle="collapse" href="#collapse' + ids.collapse + '">' + file.getName() +
        '</a></h4></span></div><div class="collapse panel-collapse" id="collapse' + ids.collapse + '"><div class="panel-body dpdwnPB" ' +
        '><div data-oembed-url="' +
        'https://docs.google.com/document/d/' + file.getId() + '/pub?embedded=true' + '"><div class="dpdwnFrmCont">' +
        '<iframe  id="frame' + ids.collapse + '"  allowfullscreen="" data-src="' + 'https://docs.google.com/document/d/' + file.getId() + '/pub?embedded=true' + '" class="dpdwnIfrm" tabindex="-1"></iframe></div></div></div></div></div>';

    var htmlMobile = htmlDesktop;

    return [htmlDesktop, htmlMobile];
}

/** 
 * Generates the html code for a video drop down.
 *
 * @param file - the google script file object to make html for
 * @param ids- an object containing the reference to the collapse and accordion ids
 * 
 * @return The Html code for the give file
 */
function dropDownVideo(file,ids){
   file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    var htmlDesktop = '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">' +
        '<span onclick="loadVideoIframe(&apos;' + ids.collapse + '&apos;)"><a data-parent="#accordion' + ids.accordion + '" class="collapsible-item-title-link-icon pull-right" data-toggle="collapse"' +
        'href="#scriptIn' + ids.collapse + '" role="button"><span class="glyphicon glyphicon-chevron-down"></span></a><a data-parent="#accordion' + ids.accordion +
        '" data-toggle="collapse" href="#scriptIn' + ids.collapse + '" class="dropDown">' + file.getName() + '</a></span></h4></div><div class="collapse playableVideoDiv panel-collapse" id="scriptIn' + ids.collapse + '"> <div class="panel-body"><div>' +
        '<div class="dropDownVideoContainer"><iframe id="frame' + ids.collapse + '" allowfullscreen="" data-src="https://drive.google.com/uc?export=view&id=' + file.getId() +
        '"class="dropDownVideoIframe" tabindex="-1"></iframe></div></div></div></div></div>';
  
    var htmlMobile = htmlDesktop;
  
    return [htmlDesktop, htmlMobile];
}
/** 
 * Generates the html code for an audio drop down.
 *
 * @param file - the google script file object to make html for
 * @param ids- an object containing the reference to the collapse and accordion ids
 * 
 * @return The Html code for the give file
 */
function dropDownAudio(file,ids){
   file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
  
    var htmlDesktop = '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">' +
        '<a data-parent="#accordion' + ids.accordion + '" class="collapsible-item-title-link-icon pull-right" data-toggle="collapse"' +
        'href="#scriptIn' + ids.collapse + '" role="button"><span class="glyphicon glyphicon-chevron-down"></span></a><a data-parent="#accordion' + ids.accordion +
        '" data-toggle="collapse" href="#scriptIn' + ids.collapse + '" class="dropDown">' + file.getName() + '</a></h4></div><div class="collapse playableAudioDiv panel-collapse" id="scriptIn' + ids.collapse + '"> <div class="panel-body"><div>' +
        '<div style="left: 0; width: 100%; height: 50px; position: relative;"><audio controls style="width:100%"><source id="source' + ids.collapse + '" src="https://drive.google.com/uc?export=view&id=' + file.getId() +
        '" type="audio/mpeg"></audio>	</div></div></div></div></div>';
  
    var htmlMobile = htmlDesktop;
  
    return [htmlDesktop, htmlMobile];
}


/** 
 * Generates the html code for a pdf drop down.
 *
 * @param file - the google script file object to make html for
 * @param ids- an object containing the reference to the collapse and accordion ids
 * 
 * @return The Html code for the give file
 */
function dropDownPdf(file, ids) {
    //Logger.log(file.getName());
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    var htmlDesktop = '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">' +
        '<span onclick="loadIframe(&apos;frame' + ids.collapse + '&apos;)"><a data-parent="#accordion' + ids.accordion + '" class="collapsible-item-title-link-icon pull-right" data-toggle="collapse"' +
        'href="#scriptIn' + ids.collapse + '" role="button"><span class="glyphicon glyphicon-chevron-down"></span></a><a data-parent="#accordion' + ids.accordion +
        '" data-toggle="collapse" href="#scriptIn' + ids.collapse + '" class="dropDown">' + file.getName() + '</a></span></h4></div><div class="collapse panel-collapse" id="scriptIn' + ids.collapse + '"> <div class="panel-body"><div>' +
        '<div class="dpdwnFrmCont"><iframe id="frame' + ids.collapse + '" allowfullscreen="" data-src="https://drive.google.com/uc?export=view&id=' + file.getId() +
        '"class="dpdwnIfrm" tabindex="-1"></iframe></div></div></div></div></div>';

    var htmlMobile = '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">' +
        '<span onclick="loadIframe(&apos;frame' + ids.collapse + '&apos;)"><a data-parent="#accordion' + ids.accordion + '" class="collapsible-item-title-link-icon pull-right" data-toggle="collapse"' +
        'href="#scriptIn' + ids.collapse + '" role="button"><span class="glyphicon glyphicon-chevron-down"></span></a><a data-parent="#accordion' + ids.accordion +
        '" data-toggle="collapse" href="#scriptIn' + ids.collapse + '" class="dropDown">' + file.getName() + '</a></span><a href="https://drive.google.com/uc?export=view&id=' + file.getId() + '" download>' +
        '<img class="content-download docDownld" alt="Download" src="https://5il.co/lfva"/>' +
        '</a></h4></div><div class="collapse panel-collapse" id="scriptIn' + ids.collapse + '"> <div class="panel-body"><div' +
        '><div class="dpdwnFrmCont">' +
        '<iframe id="frame' + ids.collapse + '" allowfullscreen="" data-src="https://drive.google.com/file/d/' + file.getId() + '/preview" class="dpdwnIfrm" tabindex="-1"></iframe></div></div></div></div></div>';
  
    return [htmlDesktop, htmlMobile];
}


/**
 * Generates the html code for a spreadsheet drop down.
 *
 * @param file - the google script file object to make html for
 * @param ids- an object containing the reference to the collapse and accordion ids
 * 
 * @return The Html code for the give file
 */
function dropDownSheet(file, ids) {
    var htmlDesktop = '<div class="panel panel-default"> <div class="panel-heading"> <h4 class="panel-title"><span onclick="loadIframe(&apos;frame' + ids.collapse + '&apos;)">' +
        '<a class="collapsible-item-title-link-icon pull-right" data-parent="#accordion' + ids.accordion + '" data-toggle="collapse" href="#collapse' +
        ids.collapse + '" role="button"> <span class="glyphicon glyphicon-chevron-down"></span> </a>' +
        '<a data-parent="#accordion' + ids.accordion + '" data-toggle="collapse" href="#collapse' + ids.collapse + '">' + file.getName() +
        '</a></h4></span></div><div class="collapse panel-collapse" id="collapse' + ids.collapse + '"><div class="panel-body dpdwnPB" ' +
        '><div data-oembed-url="' +
        'https://docs.google.com/spreadsheets/d/' + file.getId() + '/pub?embedded=true' + '"><div class="dpdwnFrmCont">' +
        '<iframe  id="frame' + ids.collapse + '"  allowfullscreen="" data-src="' + 'https://docs.google.com/spreadsheets/d/' + file.getId() + '/pub?embedded=true' + '" class="dpdwnIfrm" tabindex="-1"></iframe></div></div></div></div></div>';

    var htmlMobile = htmlDesktop;

    return [htmlDesktop, htmlMobile];
}



/**
 * Sorts the passed in list based on the selection from the referenced spread sheet. 
 * If no sheet is found, default sort is alphabetical
 * 
 * @param toSort - the list to sort
 * 
 * @return The sorted list
 */
function selectedSort(toSort, sortOptionSheetId) {
    var sortMethod = "alphabet"; //Sets default method
    var extraSortOptions = [];
    var topItems = [];
  
    var ss = SpreadsheetApp.openById(sortOptionSheetId); //Opens spreadsheet document
    var sheet = ss.getSheetByName('Sheet1'); //opens sheet1 of that document
    var data = sheet.getRange(2, 2, 4).getValues(); //gets 3 rows and 1 column starting at cell 2,2
    if(data[0][0] == 1){sortMethod = "alphabet";} //checks if alphabet was marked
    else if(data[1][0] == 1){sortMethod = "dateUpdated";} //checks if dateUpdated was marked
    else if(data[2][0] == 1){sortMethod = "dateCreated";}  //checks if dateCreated was marked
    else if(data[3][0] == 1){sortMethod = "dateInName";} //


    //Checks for extra sort preferences
    data = sheet.getRange(2, 5, 2).getValues(); //gets 2 rows and 1 column starting at cell 2,5
    if(data[0][0] == 1){extraSortOptions.push("manualOrder")};
    if(data[1][0] == 1){extraSortOptions.push("reverse")};

    //Runs if the extra sort option was chosen
    if(extraSortOptions.indexOf("manualOrder") != -1)
    {
        var numberOfOrdered = sheet.getDataRange().getHeight();
        data = sheet.getRange(3, 7, numberOfOrdered-2, 2).getValues();
        for(var i = 0; i < toSort.length; i++){
            for(var j = 0; j < data.length; j++){
                if(toSort[i].name == data[j][0])
                {
                    topItems.push({object:toSort[i], rank:data[j][1]})
                    toSort.splice(i,1);
                    i--;
                    break;
                }
            }
        }

        topItems.sort(function(a, b){return b.rank - a.rank });
    }

  
    //Sorts the toSort list based on the sortMethod selected
    if (sortMethod == "alphabet") {
        toSort.sort(function (a, b) {
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase();

            return aName.localeCompare(bName);
        });
    }
    else if (sortMethod == "dateUpdated") {
        toSort.sort(function (a, b) {
            return b.dateUpdated - a.dateUpdated;
        });
    }
    else if (sortMethod == "dateCreated") {
        toSort.sort(function (a, b) {
            return b.dateCreated - a.dateCreated;
        });
    }
    else if (sortMethod == "dateInName")
    {
        toSort.sort(function (a, b) {
            const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase();
            var aMonth = -1;
            var bMonth = -1;
            for(var i = 0; i<months.length; i++)
            {
                if(aName.indexOf(months[i]) != -1)
                {
                    aMonth = i;
                }
                if(bName.indexOf(months[i]) != -1)
                {
                    bMonth = i;
                }
            }

            if(aMonth != -1 && bMonth != -1)
            {
                if(aMonth != bMonth)
                {
                    return aMonth - bMonth;
                }
                else
                {
                    return aName.localeCompare(bName);
                }
            }
            else if(aMonth != -1)
            {
                return -1;
            }
            else if(bMonth != -1)
            {
                return 1;
            }
            else
            {
                return aName.localeCompare(bName);
            }
        });
    }


    if(extraSortOptions.indexOf("reverse") != -1)
    {
        toSort.reverse();
    }

    for(var i = 0; i < topItems.length; i++)
    {
        toSort.unshift(topItems[i].object);
    }

    return toSort;
}

/**
 * Checks if there is more than one file, folder, or link in the Drive
 * if there is only one it auto expands it and indicates only one
 * 
 * @param folder - the folder to check over
 * @param ids- an object containing the reference to the collapse and accordion ids
 * @param sortOptionSheetId Spreadsheet that dictates sort method. If not here will default to alphabetical
 * 
 * @return A list containing a: boolean value, true if the fill has more than one file, folder, or link; html code for desktop; html code for mobile
 */
function checkFolderFill(folder, ids, sortOptionSheetId)
{
    var file; //Stores individual file date
    var folder;
    var linkFile; //Saves the file info for the link file
    var filled = false; //Bool for if the folder has more than one file, folder, or link
    var countFile = 0; //Number of Files
    var countFolder = 0; //Number of Folders
    var countLinks = 0; //Number of links
    
    var subFolders = folder.getFolders(); //Gets a list of subfolders in the folder
    var files = folder.getFiles(); //Gets a list of files in the folder
    
    while(subFolders.hasNext())
    {
        countFolder++; //Increments the count for every subfolder
        subFolders.next(); 
       // Logger.log(folder.name);
    } 

    while(files.hasNext()){
        file = files.next();
        //Logger.log(file.name);
        //Checks if the file is the designated link spreadsheet
        if(file.getName() == "Links" && file.getMimeType() == 'application/vnd.google-apps.spreadsheet')
        {
            linkFile = file; //Saves the link file

            var sheet = SpreadsheetApp.openById(file.getId()).getSheetByName('Sheet1'); //Opens the sheet
            var links = sheet.getDataRange().getValues(); //Gets the links in the sheet by rows
            countLinks = links.length - 1; //records the number of links
        }
        else{countFile++;}//Counts all files that aren't the link files
    }
    
    //Checks if there is more than one item
    if((countFolder + countFile + countLinks) > 1)
    {
        filled = true; //indicates there is more than one item
    }
    else
    {  
        var nameCheck; //Holds index of items to be removed from the name
        var htmlFill; //To fill both html strings
        var deskHtml = ''; //Empty variable for html 
        var mobiHtml = ''; //Empty variable for html
        var htmlList = ['', ''];//Empty variable for html
        
        //Sorts type file, folder, or link
        if(countFolder == 1)
        {        //If it was a single folder

            var subFolder = folder.getFolders().next(); //Gets the single folder
            
            //Verify there are no ' in the folder name. Removes them if there are.
            nameCheck = subFolder.getName().indexOf("'");
            while (nameCheck != -1) {
                subFolder.setName(subFolder.getName().replace("'", ""));
                nameCheck = subFolder.getName().indexOf("'");
            }
        
            ids.collapse++; //Increments unique id
            //Creates the Html Code to start the folder drop down
            htmlFill = '<div class="panel-group" id="accordion' + ids.accordion + '">'+'<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">' +
                    '<a class="collapsible-item-title-link-icon pull-right" data-toggle="collapse" data-parent="#accordion' + ids.accordion +
                    '" href="#collapse' + ids.collapse + '" role="button"><span class="glyphicon glyphicon-chevron-down"></span></a>' +
                    '<a data-parent="#accordion' + ids.accordion + '" data-toggle="collapse" href="#collapse' + ids.collapse + '" class="dropDown">' +
                    subFolder.getName() + '</a></h4></div><div class="collapse panel-collapse in" id="collapse' + ids.collapse + '">' +
                    '<div class="panel-body dpdwnPB">'
            deskHtml += htmlFill;
            mobiHtml += htmlFill;


            ids.accordion++; //increments the level for the folders contents
            htmlList = readFolders(subFolder, ids, sortOptionSheetId); //Calls readFolders on the folders contents
            deskHtml += htmlList[0]; //adds the code for the folder contents to its body
            mobiHtml += htmlList[1]; //adds the code for the folder contents to its body
            ids.accordion--; //returns to the correct level value

            htmlFill = '</div></div></div></div>'; //Ends folder Body
            deskHtml += htmlFill;
            mobiHtml += htmlFill;

    
        }
        else if(countFile == 1)
        { //If it was a single file
            var deskLink = ''; //creates a variable for the desktop link
            var mobiLink = ''; //creates a variable for the mobile link

            var files = folder.getFiles()//Gets list of files
            var file = files.next(); //gets first file
            ids.collapse++; //Increments unique id


            //If the file is the links spreadsheet get the next file
            if(file.getName() == "Links" && file.getMimeType() == 'application/vnd.google-apps.spreadsheet'){file = files.next();}

            //Sorts the type of file
            if (file.getMimeType() == 'application/pdf') { //Creates the link for pdfs 
                file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
                var htmlPartialReturn = dropDownPdf(file, ids);
                deskHtml = htmlPartialReturn[0];
                mobiHtml = htmlPartialReturn[1];
            }
            else if (file.getMimeType() == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.getMimeType() == 'application/msword' ||
                    file.getMimeType() == 'application/vnd.google-apps.document') 
            { //Creates the link for doc, docx, and google docs
                deskLink = 'https://docs.google.com/document/d/' + file.getId() + '/pub?embedded=true';
                mobiLink = deskLink;
                deskHtml = '<div data-oembed-url="' + deskLink + '"><div class="dpdwnFrmCont">' +
                    '<iframe  id="frame' + ids.collapse + '"  allowfullscreen="" src="' + deskLink + '" class="dpdwnIfrm" tabindex="-1"></iframe></div></div>';
                mobiHtml = '<div data-oembed-url="' + mobiLink + '"><div class="dpdwnFrmCont">' +
                    '<iframe  id="frame' + ids.collapse + '"  allowfullscreen="" src="' + mobiLink + '"class="dpdwnIfrm" tabindex="-1"></iframe></div></div>';   
            }
            else if (file.getMimeType() == 'application/vnd.google-apps.spreadsheet') 
            { //Creates the link for google sheets
                deskLink = 'https://docs.google.com/spreadsheets/d/' + file.getId() + '/pub?embedded=true';
                mobiLink = deskLink; 
                deskHtml = '<div data-oembed-url="' + deskLink + '"><div class="dpdwnFrmCont">' +
                    '<iframe  id="frame' + ids.collapse + '"  allowfullscreen="" src="' + deskLink + '" class="dpdwnIfrm" tabindex="-1"></iframe></div></div>';
                mobiHtml = '<div data-oembed-url="' + mobiLink + '"><div class="dpdwnFrmCont">' +
                    '<iframe  id="frame' + ids.collapse + '"  allowfullscreen="" src="' + mobiLink + '" class="dpdwnIfrm" tabindex="-1"></iframe></div></div>';         
            }

            //Creates the html for the desktop and mobile views
               
        }
        else if(countLinks == 1)
        {//If it was a single link

            var linkLists = [[],[]]; //List of lists to hold the return from processLinks
            linkLists = processLinks(linkFile, [],[]); //Calls process list to get the html for the link
            
            //Sets the html from the link whether it was important or not
            for(var i = 0; i<linkLists.length; i++)
            {
                if(linkLists[i].length >= 1)
                {
                deskHtml = linkLists[i][0].htmlDesktop;
                mobiHtml = linkLists[i][0].htmlMobile; 
                }
            }
        }
        else 
        {//Sets html to coming soon if no files are in the folder at all
        deskHtml = '<div class="CHSImportant">Coming Soon</div>'; 
        mobiHtml = deskHtml;
        }
    }

    //returns the boolean and html code
    return [filled, deskHtml, mobiHtml]
}
                            
/**
 * Process the Links Document and makes the html code for each link
 * storing it in the correct list
 * 
 * @param file - the spreadsheet file containing the links
 * @param importantList - the current list of files and folders marked as important
 * @param sortList - the current list of files and folders NOT marked as important
 * 
 * @return [importantList, sortList] - the updated important and sort lists
 */
function processLinks(file, importantList, sortList)
{
    var important = false; //Sets the Default importance value
    var name = ''; //The name from the spreadsheet cell
    var htmlLink = ''; //The link from the spreadsheet cell
    var targetTab = '_blank'; //The default tab target for pages to open in a new tab

    var sheet = SpreadsheetApp.openById(file.getId()).getSheetByName('Sheet1'); //Opens Sheet one of the passed in file
    var links = sheet.getDataRange().getValues(); //Gets the data range of the opened sheet

    //Loops over all the links, skipping the first row of headers
    for(var i = 1; i < links.length; i++)
    {  
        targetTab = '_blank'; //Resets the default tab target for pages to open in a new tab
        important = false; //Resets the Default importance value

        //Checks if the link has been marked with an * as the first character of the name
        name = links[i][0]; 
        if(name.indexOf("*") == 0)
        {
            //Marks the link as important and removes the asterisk from the name string so it doesn't display
            //Does NOT change folder name here
            important = true;
            name = name.substring(1);
        }

        //Checks if the link is internal
        if(links[i][1].indexOf('isd391.org') != -1)
        {
            //Sets the tab target to open in the same tab if link is local
            targetTab = '_self'; 
        }

        //Creates the html code for a link
        htmlLink = '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><a href="' + 
                    links[i][1] + '" role="button" target="' + targetTab + '"><img alt="" class="pull-right lnkimg" src="https://5il.co/lfv9"' +
                    '/>' + name + '</a></h4> </div> </div>';


        //If the link was marked as important adds it to the important list for sorting
        if(important)
        {
            //This adds an object with the link information to the list. It allows sorting 
            //by many methods and contains the html code to put together after sorting
            importantList.push({ name: name, dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlLink, htmlMobile: htmlLink });
        }
        else
        {
            //This adds an object with the link information to the list. It allows sorting 
            //by many methods and contains the html code to put together after sorting
            sortList.push({ name: name, dateUpdated: file.getLastUpdated(), dateCreated: file.getDateCreated(), htmlDesktop: htmlLink, htmlMobile: htmlLink });
        }
    }

    //Returns the added to lists
    return [importantList, sortList]
}







