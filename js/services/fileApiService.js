(function() {
    'use strict';

    angular
        .module('MetronicApp')
        .factory('FileApiService', FileApiService);

    FileApiService.$inject = ['$http', '$rootScope'];

    function FileApiService($http, $rootScope) {
        const Base_URL = $rootScope.Base_URL;                                     // "http://52.4.14.123/ectd"; 

        const service = {};
        
        service.GetAppFileList = GetAppFileList;
        service.GetFileById = GetFileById;
        service.FileDelete = FileDelete;
        service.DownloadFileByUuid = DownloadFileByUuid;
        service.BatchUpdate = BatchUpdate;
        service.SaveEdits = SaveEdits;
        //service.AssignFile = AssignFile;
        //service.CreateFolder = CreateFolder;
        //service.GetAssignedFileByAppUid = GetAssignedFileByAppUid;

        return service;

        function GetAppFileList(userData, appId){    
            return $http({
                method: 'GET',
                url:  `${Base_URL}/applications/${appId}/files`, 
                headers: {'Content-Type': 'application/json', 'Authorization': 'JWT '+userData.token}
            }).then(handleSuccess, handleError('Error in creating Application Files'));
        }

        function GetFileById(fileId, userData) {
            return $http.get(Base_URL + '/a/application/file/get_by_file_id/' + fileId + '?uid=' + userData.uid +
                "&apptoken=" + userData.access_token).then(handleSuccess, handleError('Error getting file by uuid'));
        }

        // function FileCreate(userData, appUid, postData) {                             // it is used to upload file
        //     return $http.post(Base_URL + '/a/application/file/create/appUid/'+appUid+'/?uid=' + userData.uid +
        //         "&apptoken=" + userData.access_token, postData).then(handleSuccess, handleError('Error creating file info'));
        // }

        // function FileUpdate(userData, postData) {                               //console.log(postData); 
        //     return $http.post(Base_URL + '/a/application/file/update.json?uid=' + userData.uid +
        //         "&apptoken=" + userData.access_token, postData).then(handleSuccess, handleError('Error in updating file info'));
        // }

        function FileDelete(userData, fid) {
            return $http({
                method: 'DELETE',
                url:  `${Base_URL}/files/${fid}`, 
                headers: {'Content-Type': 'application/json', 'Authorization': 'JWT '+userData.token}
            }).then(handleSuccess, handleError('Error in Deleting Application File'));
        }
        function DownloadFileByUuid(uuid, userData){
            return $http.get(Base_URL + "/a/application/file/download/" + uuid +"/?uid=" + userData.uid +
                "&apptoken=" + userData.access_token).then(handleSuccess, handleError('Error at downloading file'));
        }
        function BatchUpdate(userData, appUid, batchData){
            return $http.post(Base_URL + '/a/application/node/batch_update/appUid/'+appUid+'/?uid=' + userData.uid +
                "&apptoken=" + userData.access_token, batchData).then(handleSuccess, handleError('Error batch updating nodes!'));
        }
        function SaveEdits(uuid, userData, editData){
            return $http.post(Base_URL + '/a/application/file/save_state/'+ uuid +'?uid=' + userData.uid +
                "&apptoken=" + userData.access_token, editData).then(handleSuccess, handleError('Error in updating file info'));
        }
        /*function AssignFile(uuid, nodeId, userData){
            return $http.get(Base_URL + "/a/application/file/assign/"+uuid+"?id=" + nodeId +"/?uid=" + userData.uid +
                "&apptoken=" + userData.access_token).then(handleSuccess, handleError('Error at downloading file'));
        }
        function CreateFolder(userData, appUid, postData){
            return $http.post(Base_URL + '/a/application/folder/create/appUid/'+appUid+'/?uid=' + userData.uid +
                "&apptoken=" + userData.access_token, postData).then(handleSuccess, handleError('Error creating file info'));
        }
        
        function GetAssignedFileByAppUid(userData, appUid){
            return $http.get(Base_URL +"/a/application/file/getAssignedByAppUid/"+ appUid +'/?uid=' + userData.uid +
                "&apptoken=" + userData.access_token).then(handleSuccess, handleError('Error getting application file list'));
        }*/

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function() {
                return { success: false, message: error };
            };
        }
    }

})();