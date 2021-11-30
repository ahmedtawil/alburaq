const mongoose = require('mongoose')
const Unit = require('../../models/Unit')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');

// get new Program page 

exports.getUnitsPage = catchAsyncErrors(async (req, res) => {
  res.render('unit/list')
})


exports.getUnitsData = catchAsyncErrors(async (req, res) => {
  const query = req.query

  const queryValue = (req.query.search.value == '') ? {} : JSON.parse(query.search.value)
  let queryObj = {}

  if (queryValue.filter) {
    queryObj.$and = [queryValue.filter]
  }

  if (queryValue.search) {
    let val = queryValue.search
    const qu = {
      $regex: val,
      $options: 'i'
    }
    const searchQuery = { $or: [{ title: qu }, { weight: qu }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const unitsCount = await Unit.estimatedDocumentCount()
  const unitsFillterCount = await Unit.find(queryObj).countDocuments()
  const units = await Unit.find(queryObj).limit(parseInt(query.length)).skip(parseInt(query.start))

  return res.json({
    recordsTotal: unitsCount,
    recordsFiltered: unitsFillterCount,
    units
  })


})


// post new Program

exports.newUnit = catchAsyncErrors(async (req, res) => {
  const data = req.body
  const newUnit = new Unit(data)
  await newUnit.validate()
  newUnit.save()
  res.end()

})
// post editPage 

exports.editUnit = catchAsyncErrors(async (req, res) => {
  if (req.access.can(req.user.role).updateAny('program').granted) {

    let program = null
    const id = req.params.id

    if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))
    program = await Program.findById(id)
    if (!program) return next(new ErrorHandler('', 404))

    let data = JSON.parse(req.body.payload)
    _.assign(program, data)
    await program.save()
    res.send(program)
  } else {
    next(new ErrorHandler('unauthrized!', 403))
  }

})



