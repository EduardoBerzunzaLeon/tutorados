const { Router } = require('express');

module.exports = function({
    SeedController,
}) {

    const router = Router();
    
    router.get('/', 
        SeedController.loadSeed
    );

    return router;
}