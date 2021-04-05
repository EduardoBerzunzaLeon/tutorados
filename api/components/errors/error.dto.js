class ErrorDTO {
  sendErrorDevelopment = (err) => ({
    statusCode: err.statusCode,
    object: {
      status: err.status,
      error: err,
      msg: err.msg,
      stack: err.stack,
    },
  });

  sendErrorProduction = (err) => {
    // A) API
    // A) Operational, trusted error: send msg to client
    if (err.isOperational) {
      return {
        statusCode: err.statusCode,
        object: {
          status: err.status,
          msg: err.msg,
        },
      };
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic msg
    const statusCode = 500;
    return {
      statusCode,
      object: {
        status: 'error',
        msg: 'Something went very wrong!',
      },
    };
  };
}

module.exports = ErrorDTO;
