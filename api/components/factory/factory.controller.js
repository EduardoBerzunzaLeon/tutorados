  exports.findDocs =  (controller) => async (req, res) => {

    const [ total, docs ] = await controller.service.find(req.query);
      const docsSend = controller.dto.multiple(docs);
  
      return res.status(200).json({
        status: 'success',
        total,
        data: docsSend,
      });
  }

  exports.findById = (controller) => async (req, res) => {
    const { id } = req.params;
    const doc = await controller.service.findById(id);
    const docSend =  controller.dto.single(doc);

    return res.status(200).json({ 
      status: 'success',
      data: docSend
    }); 
  }

  exports.updateByMethod = (controller, method) =>  async (req, res) => {

    const { id } = req.params;
    const doc = await method(id, req.body);
    const docSend = controller.dto.single(doc);

    return res.status(200).json({
      status: 'success',
      data: docSend,
    });

  }

  exports.updateById = (controller) =>  async (req, res) => {
    const { id } = req.params;
    const doc = await controller.service.updateById(id, req.body);
    const docSend = controller.dto.single(doc);

    return res.status(200).json({
      status: 'success',
      data: docSend,
    });
  }
  
  exports.updateWithFile = (controller) => async (req, res) => {
    const { id } = req.params;
    const { file } = req;
    const doc = await controller.service.updateById(id, req.body, file);
    const docSend = controller.dto.single(doc);

    return res.status(200).json({
      status: 'success',
      data: docSend,
    });
  }

  exports.create = (controller) => async (req, res) => {
    const doc = await controller.service.create(req.body);
    const docSend = controller.dto.single(doc);

    return res.status(200).json({
      status: 'success',
      data: docSend,
    });
  }

  exports.createWithFile = (controller) => async (req, res) => {
    const { file } = req;

    const doc = await controller.service.create(req.body, file);
    const docSend = controller.dto.single(doc);

    return res.status(200).json({
        status: 'success',
        data: docSend,
    });
  }

  exports.deleteById = (controller) => async (req, res) => {
    const { id } = req.params;
    await controller.service.deleteById(id);
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  }
