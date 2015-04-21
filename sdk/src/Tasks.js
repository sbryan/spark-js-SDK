var ADSKSpark = ADSKSpark || {};


ADSKSpark.TaskWaiter = function( progressCallback )
{
    var _taskId, _interval;

    function checkTaskResponse(taskResponse)
    {
        if( taskResponse.body.status === 'done' )
        {
            var result = res.body.result;
            return result;
        }
        if( taskResponse.body.status === 'error' )
        {
            return Promise.reject(taskResponse);
        }
        if( progressCallback )
            progressCallback( taskResponse.body.progress );

        return new Promise(function(resolve, reject) {
            setTimeout(_this._pollTask, interval);
        });
    }


    this._pollTask = function()
    {
        return Client.authorizedApiRequest('/print/tasks/' + _taskId)
                .post().then(checkTaskResponse);
    }


    this.wait = function(opResult, interval) 
    {
        var _this = this;

        interval = interval || 100;
        if( interval < 10 )
            interval = 10;

        _taskId = opResult.id; // or is it body.id ?


        return this._pollTask();
    };
};
