module.exports = ({
    catchAsync,
    FailedSubjectDTO,
    FailedSubjectsService,
  }) => {

    const self = {
      catchAsync,
      dto: FailedSubjectDTO,
      service: FailedSubjectsService,
    };

    const findErrors = (self) =>  async (req, res) => {
      const [ total, docs ]  = await self.service.findErrors(req.query);
      const docsSend = self.dto.multiple(docs);
  
      return res.status(200).json({
        status: 'success',
        total,
        data: docsSend,
      });
    }
  
    const methods = (self) => ({
      findErrors: self.catchAsync(findErrors(self)),
    });
  
    return methods(self);
};
  