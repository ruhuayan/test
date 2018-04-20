angular.module('MetronicApp').controller('SubmissionCtrl', ['$rootScope','$scope','$state','$cookies','$stateParams','CookiesApiService', 'ApplicationApiService',
'TemplateApiService', 'ModalService', "DTOptionsBuilder",
    function($rootScope, $scope, $state, $cookies, $stateParams, CookiesApiService, ApplicationApiService, TemplateApiService, ModalService, DTOptionsBuilder) {
        
        $scope.changeLanguage($stateParams['lang']);
        var dest = $stateParams['lang']=="cn"? "中國" : "USA";

        var appData; 
        if(CookiesApiService.GetCookies())
            appData = $rootScope.appData;
        else {
            appData = {"version": "0000", destination: dest};                            //console.log('app data:', $rootScope.userData.role==="Admin");
        }
        var dtOptions = {
                    sEmptyTable: "Empty Table",
                    order: [3, 'desc'],                   
                    lengthMenu: [5, 10],
                    columnDefs: [{
                         targets: 3,
                         responsivePriority: 1,
                         filterable: false,
                         sortable: false,
                         orderable: false
                     }]
                };
        $scope.dtInstance = {};
        $scope.submissions = [{}];                    // to make sure data-table has json data
        if($rootScope.applications) {
            $scope.submissions = $rootScope.applications;
            $scope.dtOptions = dtOptions;
        } else {                                                                                          //console.log("Applications loading...");
            ApplicationApiService.GetClientAppList($rootScope.userData, 1, 50).then(function(data){     //console.log("api service", data.list);
                if(!data.list) {$rootScope.applications=[]; return;}
                $scope.submissions =  $rootScope.applications = data.list;//.slice(0,8);        //console.log($rootScope.applications)
                $scope.dtOptions = dtOptions;
            });
        }
                                                                  
        if(appData.appUid){                                         
            $scope.submitLabel = "EDITAPP";
            $scope.template = appData.template;                                 //console.log("template", appData);         
            $scope.uneditable = true;
        }else{
            getTemplateList();                         // to create templates
            $scope.submitLabel = "CREATEAPP"; 
            $scope.uneditable = false;
        }
        $scope.formData = angular.copy(appData);

        $scope.toggleEditable = function(){
            $scope.uneditable =!$scope.uneditable;
        };
        
        $scope.createApp = function(){                                          //console.log($scope.subForm.$valid);                               
            if($scope.subForm.$valid){
                var tid =  $scope.template.id || JSON.parse($scope.template).id;
                $scope.formData.template = {'id': tid};                         //console.log("template", tid);
                var jsonData = $scope.formData;                                 //console.log("appdata: ", jsonData);
                
                if(appData.appUid){
                    // for update to work, i have to get rid of unnecessary field
                    jsonData ={"appUid": jsonData.appUid, "version":jsonData.version, "description": jsonData.description,
                        "template": jsonData.template, "folder": jsonData.folder, "sequence": jsonData.sequence};                console.log(jsonData);
                    
                    ApplicationApiService.ApplicationUpdate($rootScope.userData, jsonData).then(function(result){                    console.log(result);
                        if(result.appUid){
                            $rootScope.appData = ApplicationApiService.ExtractApp(result);
                            toastr.success("Updated Application number: " + result.folder);
                            var cookieExp = new Date();
                            cookieExp.setDate(cookieExp.getDate() + 1);
                            $cookies.putObject('appData', $rootScope.appData, { expires: cookieExp});          
                            $state.go("editinfo").then(function() {}); 
                        }
                    });
                }else{
                    App.blockUI({
                        target: $("body"),
                        message: " Load ...",
                        //animate: true,
                        overlayColor: "#999"//'#d9534f'
                    });
                    ApplicationApiService.ApplicationCreate($rootScope.userData, jsonData).then(function(result){                      console.log(result);      // res.success ==false
                        if(result.appUid){
                            App.unblockUI($("body"));
                            $rootScope.appData = ApplicationApiService.ExtractApp(result);
                            toastr.success("Create Application number: " + result.folder);
                            var cookieExp = new Date();
                            cookieExp.setDate(cookieExp.getDate() + 1);
                            $cookies.putObject('appData', $rootScope.appData, { expires: cookieExp});
                            delete $rootScope.applications; //$rootScope.applications.unshift(jsonData);
                            $state.go("editinfo").then(function() {}); 
                        } 
                    })
                }
            }   
            
        };
        $scope.cancelApp = function(){ 
            $scope.formData= angular.copy(appData);
            $scope.subForm.$setPristine();
            $scope.subForm.$setValidity();
            $scope.subForm.$setUntouched();
        };
         
        $scope.exitApp = function(){
            $cookies.remove("appData");
            $rootScope.appData = false;
            delete $rootScope.subFiles;
            delete $rootScope.uploadFiles;
            appData = {"version": "0000", destination: dest};
            $scope.formData= angular.copy(appData);;
            $scope.submitLabel = "CREATEAPP"; 
            $scope.template= {};
            if(!$scope.templates) getTemplateList();
//            $scope.subForm.$setPristine();
//            $scope.subForm.$setValidity();
//            $scope.subForm.$setUntouched();
            $scope.uneditable = false;
            //$scope.subForm.$valid = true;                                                                    console.log($scope.subForm.$valid);  
        };
        
        $scope.view = function(sub){
            toastr.success('View Application ID: '+ sub.id);
            //$state.go("fileupload").then(function() {});    
        };
        $scope.edit = function(submission){                                             //console.log(submission)
            toastr.success("Application number: " + submission.folder);
            delete $rootScope.subFiles;
            delete $rootScope.uploadFiles;
            //var submission = ApplicationApiService.GetApplicationById($scope.submissions, id);         //getSubById(id);                                                                   
            if(submission){
                $rootScope.appData = appData = ApplicationApiService.ExtractApp(submission);
                //$rootScope.uploadFiles = submission.ectdFileList;               console.log($rootScope.uploadFiles);
                $scope.submitLabel = "EDITAPP";
                var cookieExp = new Date();
                cookieExp.setDate(cookieExp.getDate() + 1);
                $cookies.putObject('appData', appData, { expires: cookieExp});   //console.log(submission) 
                $scope.formData = angular.copy(submission);
                $scope.template = submission.template;                          // console.log($scope.template)   
                $scope.uneditable = true;
                
            }        
        };
        $scope.delete = function(submission,index){                 //console.log(submission)

            ModalService.showModal({
                templateUrl: "tpl/modal.html",
                controller: function($scope, title, close){
                    $scope.title = title;
                    $scope.close = function(result) {
                        close({appNumber: $scope.appNumber, sequence: $scope.sequence}, 300); // close, but give 500ms for bootstrap to animate
                    };
                },
                preClose: function(modal){ modal.element.modal('hide'); },
                inputs:{
                    title: "Delete an Application? "
                }
            }).then(function(modal) {
                //it's a bootstrap element, use 'modal' to show it
                modal.element.modal();
                modal.close.then(function(result) {                                           //console.log(result);
                    if(!result) return;
                    if(result.appNumber !== submission.folder || result.sequence !== submission.version) return;

                    $scope.submissions.splice(index, 1);
                    // $scope.dtOptions = DTOptionsBuilder.fromSource($scope.submissions);
                    $scope.dtInstance._renderer.rerender();

                    if($rootScope.appData && $rootScope.appData.appUid === submission.appUid) $scope.exitApp();
                    ApplicationApiService.DeleteApplication(submission.appUid, $rootScope.userData).then(function(result){ console.log(result);
                        
                        toastr.success("Application " + submission.folder + " deleted");
                    });

                });
            });
        };
        
        function getTemplateList(){
            TemplateApiService.GetTemplateList($rootScope.userData).then(function(result){             //console.log(result)
                $scope.templates = result; 
            });
        }
    //};
    }]);
    
    // function DelYesNoCtrl($scope, $element, title, close){
    //     $scope.title = title;
    //     $scope.close = function(result) {
    //         close({appNumber: $scope.appNumber}, 300); // close, but give 500ms for bootstrap to animate
    //     };
    // }

   