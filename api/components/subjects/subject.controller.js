module.exports = ({
    catchAsync,
    FactoryController,
    SubjectDTO,
    SubjectService,
  }) => {

    const self = {
      catchAsync,
      dto: SubjectDTO,
      service: SubjectService,
    };
  

    const findSubjectsForExcel = (self) =>  async (req, res) => {
      const docs = await self.service.findForExcel();
      const docsSend = self.dto.multiple(docs);
  
      return res.status(200).json({
        status: 'success',
        data: docsSend,
      });
    }

    const methods = (self) => ({
        createSubject: self.catchAsync(FactoryController.create(self)),
        deleteSubject: self.catchAsync(FactoryController.deleteById(self)),
        findSubjectById: self.catchAsync(FactoryController.findById(self)),
        findSubjects: self.catchAsync(FactoryController.findDocs(self)),
        findSubjectsForExcel: self.catchAsync(findSubjectsForExcel(self)),
        updateSubject: self.catchAsync(FactoryController.updateById(self)),
        updateCorrelativeSubjects: self.catchAsync(
          FactoryController.updateByMethod(
            self, 
            self.service.updateCorrelativeSubjects.bind(SubjectService)
          )
        ),
    });
  
    return methods(self);
  };
  