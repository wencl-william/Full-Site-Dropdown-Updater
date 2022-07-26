/**
 * These are alternate methods for the Page fill script
 */


/**
 * Starts the read Process, runs 1 time per page
 * @param filePath The folder path to the Live folder.
 * @param propertiesId The file id the code writes too. 
 * @param javaFillTag The tag that the code fills in on the webpage
 * @param sortOptionSheetId Spreadsheet that dictates sort method. If not here will default to alphabetical
 * @param dropIds Variables to create unique ids for every dropdown on the page Format {collapse:## , accordion:##};
 */
function startReadNoCheck(filePath, propertiesId, javaFillTag, sortOptionSheetId, dropIds)
{ 
    //Searches for parent folder ******************************************Needs Validation Code******************************************************
    var folder = DriveApp.getFoldersByName(filePath[0]).next(); 
    for(var i = 1; i < filePath.length; i++)
    {
        folder = folder.getFoldersByName(filePath[i]).next(); 
    }
    
    var checkFill = [false,'','']; //hadles the return from check folder fill
    var topLogicScript;
    var docList;
    var html = ['', ''];


    //Runs the recursive code to create html code for each file
    //The Return is formated as a list with desktop and mobile html. [htmlCodeForDesktop, htmlCodeForMobile]
    html = readFolders(folder, dropIds, sortOptionSheetId);

    //This is the Java script that decides whether it is mobile of desktop and displays the returned html code in an
    //Element with the name of: javaFill1234
    topLogicScript = "document.getElementById('" + javaFillTag + "').innerHTML = '" + html[1] + "';" +
        "function loadVideoIframe(playingDivId){"+
         "var playingDiv = document.getElementById('scriptIn'+playingDivId); if(!playingDiv.classList.contains('playing'))"+
        "{ playingDiv.classList.add('playing'); loadIframe('frame'+playingDivId);}}; function loadIframe(frameID) {" +
        "var frame = document.getElementById(frameID); frame.src = frame.dataset.src; };function loadAudio(sourceID, filler) {" +
          "document.getElementById('AudioFill' + sourceID).innerHTML = filler;}"+
        "$('.playableVideoDiv').on('hidden.bs.collapse', function () { $(this).find('iframe').attr('src', ''); $(this).removeClass('playing');});"+
        "$('.playableAudioDiv').on('hidden.bs.collapse', function () { $(this).find('audio').trigger('pause'); $(this).removeClass('playing');});";
  
  
     // //This searches for and verifies that the file to write the script to exists and then writes the html
    // //Over whatever is in that file
    // docList = DriveApp.getFileById(propertiesId);
    // docList.setContent(topLogicScript);

    ScriptProperties.setProperty(propertiesId, topLogicScript);
  }


/**
 * Transfers Ownership of the files and sub folders to webmaster@isd391.org
 * @param folder The parent folder to start on
 */
function transferOwner(folder)
{
    var file; //Stores individual file data    
    var subFolders = folder.getFolders(); //Gets a list of subfolders in the folder
    var files = folder.getFiles(); //Gets a list of files in the folder
    
    while(subFolders.hasNext())
    {
        folder = subFolders.next();
        //Logger.log(folder.getName());
        folder.setOwner('webmaster@isd391.org');
        transferOwner(folder);
    } 

    while(files.hasNext()){
        file = files.next();
        //Logger.log(file.getName());
        file.setOwner('webmaster@isd391.org');
    }
}



/**
 * Rename Policies
 * @param folder The parent folder to start on Polices page
 */
function renamePolicies(folder)
{
    var file; //Stores individual file data
    var folder;
    var name;
    var search;
    var found;
    var index = [{id: 101, name: '101 - Legal Status of the School District'},{id: 101.1, name: '101.1 - Name of the School District'},{id: 102, name: '102 - Equal Educational Opportunity'},{id: 103, name: '103 - Complaints – Students, Employees, Parents, Other Persons'},{id: 104, name: '104 - School District Mission Statement'},{id: 201, name: '201 - Legal Status of the School Board'},{id: 202, name: '202 - School Board Officers'},{id: 203, name: '203 - Operation of the School Board – Governing Rules'},{id: 203.1, name: '203.1 - School Board Procedures; Rules of Order'},{id: 203.2, name: '203.2 - Order of the Regular School Board Meeting'},{id: 203.5, name: '203.5 - School Board Meeting Agenda'},{id: 203.6, name: '203.6 - Consent Agendas'},{id: 204, name: '204 - School Board Meeting Minutes'},{id: 205, name: '205 - Open Meetings and Closed Meetings'},{id: 206, name: '206 - Public Participation in School Board Meetings/Complaints about Persons at School Board Meetings and Data Privacy Considerations'},{id: 207, name: '207 - Public Hearings'},{id: 208, name: '208 - Development, Adoption, and Implementation of Policies'},{id: 209, name: '209 - Code of Ethics'},{id: 210, name: '210 - Conflict of Interest – School Board Members'},{id: 210.1, name: '210.1 - Conflict of Interest – Charter School Board Members'},{id: 211, name: '211 - Criminal or Civil Action Against School District, School Board Member, Employee, or Student'},{id: 212, name: '212 - School Board Member Development'},{id: 213, name: '213 - School Board Committees'},{id: 214, name: '214 - Out-of-State Travel by School Board Members'},{id: 301, name: '301 - School District Administration'},{id: 302, name: '302 - Superintendent'},{id: 303, name: '303 - Superintendent Selection'},{id: 304, name: '304 - Superintendent Contract, Duties, and Evaluation'},{id: 305, name: '305 - Policy Implementation'},{id: 306, name: '306 - Administrator Code of Ethics'},{id: 401, name: '401 - Equal Employment Opportunity'},{id: 402, name: '402 - Disability Nondiscrimination Policy'},{id: 403, name: '403 - Discipline, Suspension, and Dismissal of School District Employees'},{id: 404, name: '404 - Employment Background Checks'},{id: 405, name: '405 - Veteran’s Preference'},{id: 406, name: '406 - Public and Private Personnel Data'},{id: 407, name: '407 - Employee Right to Know – Exposure to Hazardous Substances'},{id: 408, name: '408 - Subpoena of a School District Employee'},{id: 409, name: '409 - Employee Publications, Instructional Materials, Inventions, and Creations'},{id: 410, name: '410 - Family and Medical Leave Policy'},{id: 411, name: '411 - [Reserved for Future Use]'},{id: 412, name: '412 - Expense Reimbursement'},{id: 413, name: '413 - Harassment and Violence'},{id: 414, name: '414 - Mandated Reporting of Child Neglect or Physical or Sexual Abuse'},{id: 415, name: '415 - Mandated Reporting of Maltreatment of Vulnerable Adults'},{id: 416, name: '416 - Drug and Alcohol Testing'},{id: 417, name: '417 - Chemical Use and Abuse'},{id: 418, name: '418 - Drug-Free Workplace/Drug-Free School'},{id: 419, name: '419 - Tobacco-Free Environment; Possession and Use of Tobacco, Tobacco-Related Devices, and Electronic Delivery Devices'},{id: 420, name: '420 - Students and Employees with Sexually Transmitted Infections and Diseases and Certain Other Communicable Diseases and Infectious Conditions'},{id: 421, name: '421 - Gifts to Employees and School Board Members'},{id: 422, name: '422 - Policies Incorporated by Reference'},{id: 423, name: '423 - Employee-Student Relationships'},{id: 424, name: '424 - License Status'},{id: 425, name: '425 - Staff Development'},{id: 426, name: '426 - Nepotism in Employment – Charter Schools'},{id: 427, name: '427 - Workload Limits for Certain Special Education Teachers'},{id: 501, name: '501 - School Weapons Policy'},{id: 502, name: '502 - Search of Student Lockers, Desks, Personal Possessions, and Student’s Person'},{id: 503, name: '503 - Student Attendance'},{id: 504, name: '504 - Student Dress and Appearance'},{id: 505, name: '505 - Distribution of Nonschool-Sponsored Materials on School Premises by Students and Employees'},{id: 506, name: '506 - Student Discipline'},{id: 507, name: '507 - Corporal Punishment'},{id: 508, name: '508 - Extended School Year for Certain Students with Individualized Education Programs'},{id: 509, name: '509 - Enrollment of Nonresident Students'},{id: 510, name: '510 - School Activities'},{id: 511, name: '511 - Student Fundraising'},{id: 512, name: '512 - School-Sponsored Student Publications and Activities'},{id: 513, name: '513 - Student Promotion, Retention, and Program Design'},{id: 514, name: '514 - Bullying Prohibition Policy'},{id: 515, name: '515 - Protection and Privacy of Pupil Records'},{id: 516, name: '516 - Student Medication'},{id: 517, name: '517 - Student Recruiting'},{id: 518, name: '518 - DNR-DNI Orders'},{id: 519, name: '519 - Interviews of Students by Outside Agencies'},{id: 520, name: '520 - Student Surveys'},{id: 521, name: '521 - Student Disability Nondiscrimination'},{id: 522, name: '522 - Student Sex Nondiscrimination'},{id: 523, name: '523 - Policies Incorporated by Reference'},{id: 524, name: '524 - Internet Acceptable Use and Safety Policy'},{id: 525, name: '525 - Violence Prevention [Applicable to Students and Staff]'},{id: 526, name: '526 - Hazing Prohibition'},{id: 527, name: '527 - Student Use and Parking of Motor Vehicles; Patrols, Inspections, and Searches'},{id: 528, name: '528 - Student Parental, Family, and Marital Status Nondiscrimination'},{id: 529, name: '529 - Staff Notification of Violent Behavior by Students'},{id: 530, name: '530 - Immunization Requirements'},{id: 531, name: '531 - The Pledge of Allegiance'},{id: 532, name: '532 - Use of Peace Officers and Crisis Teams to Remove Students with IEPs from School Grounds'},{id: 533, name: '533 - Wellness'},{id: 534, name: '534 - Unpaid Meal Charges'},{id: 535, name: '535 - Service Animals in Schools'},{id: 601, name: '601 - School District Curriculum and Instruction Goals'},{id: 602, name: '602 - Organization of School Calendar and School Day'},{id: 603, name: '603 - Curriculum Development'},{id: 604, name: '604 - Instructional Curriculum'},{id: 605, name: '605 - Alternative Programs'},{id: 606, name: '606 - Textbooks and Instructional Materials'},{id: 607, name: '607 - Organization of Grade Levels'},{id: 608, name: '608 - Instructional Services – Special Education'},{id: 609, name: '609 - Religion'},{id: 610, name: '610 - Field Trips'},{id: 611, name: '611 - Home Schooling'},{id: 612.1, name: '612.1 - Development of Parent and Family Engagement Policies for Title I Programs'},{id: 613, name: '613 - Graduation Requirements'},{id: 614, name: '614 - School District Testing Plan and Procedure'},{id: 615, name: '615 - Testing Accommodations, Modifications, and Exemptions for IEPs, Section 504 Plans, and LEP Students'},{id: 616, name: '616 - School District System Accountability'},{id: 617, name: '617 - School District Ensurance of Preparatory and High School Standards'},{id: 618, name: '618 - Assessment of Student Achievement'},{id: 619, name: '619 - Staff Development for Standards'},{id: 620, name: '620 - Credit for Learning'},{id: 623, name: '623 - Mandatory Summer School Instruction'},{id: 624, name: '624 - Online Learning Options'},{id: 701, name: '701 - Establishment and Adoption of School District Budget'},{id: 701.1, name: '701.1 - Modification of School District Budget'},{id: 702, name: '702 - Accounting'},{id: 703, name: '703 - Annual Audit'},{id: 704, name: '704 - Development and Maintenance of an Inventory of Fixed Assets and a Fixed Asset Accounting System'},{id: 705, name: '705 - Investments'},{id: 706, name: '706 - Acceptance of Gifts'},{id: 707, name: '707 - Transportation of Public School Students'},{id: 708, name: '708 - Transportation of Nonpublic School Students'},{id: 709, name: '709 - Student Transportation Safety Policy'},{id: 710, name: '710 - Extracurricular Transportation'},{id: 711, name: '711 - Video Recording on School Buses'},{id: 712, name: '712 - Video Surveillance Other Than on Buses'},{id: 713, name: '713 - Student Activity Accounting'},{id: 714, name: '714 - Fund Balances'},{id: 720, name: '720 - Vending Machines'},{id: 721, name: '721 - Uniform Grant Guidance Policy Regarding Federal Revenue Sources'},{id: 722, name: '722 - Public Data Requests'},{id: 801, name: '801 - Equal Access to School Facilities'},{id: 802, name: '802 - Disposition of Obsolete Equipment and Material'},{id: 805, name: '805 - Waste Reduction and Recycling'},{id: 806, name: '806 - Crisis Management Policy'},{id: 807, name: '807 - Health and Safety Policy'},{id: 901, name: '901 - Community Education'},{id: 902, name: '902 - Use of School District Facilities and Equipment'},{id: 903, name: '903 - Visitors to School District Buildings and Sites'},{id: 904, name: '904 - Distribution of Materials on School District Property by Nonschool Persons'},{id: 905, name: '905 - Advertising'},{id: 906, name: '906 - Community Notification of Predatory Offenders'},{id: 907, name: '907 - Rewards'}];

    var subFolders = folder.getFolders(); //Gets a list of subfolders in the folder
    var files = folder.getFiles(); //Gets a list of files in the folder
    
    while(subFolders.hasNext())
    {
        subFolders.next(); 
        renamePolicies(folder);
    } 

    while(files.hasNext())
    {
        file = files.next();

        found = false;
        name = file.getName();

        search = name.indexOf('_');
        if(search != -1)
        {
            name = name.substring(0, search);
        }
        search = name.indexOf('-');
        if(search != -1)
        {
            name = name.replace("-",".");
        }

        for(var i = 0; i < index.length; i++)
        {
            if(index[i].id == name)
            {
                name = index[i].name;
                found = true;
                break;
            }
        }

        if(!found)
        {
            //Logger.log(name)
        }

        file.setName(name);
    }
}