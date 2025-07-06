// This class is used to create custom API responses that are consistent across the application. //
class ApiResponse{
    constructor(
        statusCode,
        data,
        message = "Success..."  // Default message if none is provided
    ){
       this.statusCode = statusCode;
       this.data = data;
       this.message = message;
       this.success = statusCode >= 200 && statusCode < 400;
       /*
       100-199 : Informational
       200-299 : Success
       300-399 : Redirection
       400-499 : Client Error
       500-599 : Server Error
       */
    }
}

export default ApiResponse;