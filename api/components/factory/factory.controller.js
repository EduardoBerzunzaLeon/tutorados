  exports.findDocs =  (controller) => async (req, res) => {

    const [ total, docs ] = await controller.service.find(req.query);
      const docsSend = controller.dto.multiple(docs);
  
      return res.status(200).json({
        status: 'success',
        total,
        data: docsSend,
      });
  }
  