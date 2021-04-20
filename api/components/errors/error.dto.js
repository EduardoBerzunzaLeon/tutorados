class ErrorDTO {
  sendErrorDevelopment = (err) => ({
    status: err.status,
    error: err,
  });

  sendErrorProduction = (err) => {
    // A) API
    // A) Operational, trusted error: send msg to client
    if (err.isOperational) {
      return {
        status: err.status,
        error: err,
      };
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic msg
    const statusCode = 500;
    return {
      status: 'fail',
      error: {
        isOperational: false,
        statusCode,
        status: 'fail',
        message: '¡Algo salio mal :c!',
      },
    };
  };
}

module.exports = ErrorDTO;
