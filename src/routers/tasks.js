const express = require("express")
const router = new express.Router()
const Tasks = require("../models/tasks")
const auth = require("../middleware/auth")

router.post('/tasks', auth, async (req,res)=>{
    try{
        const task = new Tasks({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    }catch(error){
        res.status(400).json({ error: error.message })
    }
})

router.get('/tasks', auth, async(req,res)=>{
    try{
        const match = {}
        if(req.query.completed){
            match.completed = req.query.completed.toLowerCase() === 'true'
        }
        await req.user.populate({
            path: 'tasks',
            match: match
        })
        res.send(req.user.tasks)
    }catch(error){
        res.status(500).json({ error: error.message })
    }
})

router.get('/tasks/:id', auth, async (req,res)=>{
    try{
        const _id = req.params.id
        const task = await Tasks.findOne({_id, "owner": req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }

        res.send(task)
    }catch(error)
    {
        res.status(500).json({ error: error.message })
    }
})

router.patch('/tasks/:id', auth, async(req,res)=>{
        const allowedKeys = ["description", "completed"]
        const requestKeys = Object.keys(req.body)
        const allowUpdateFlag = requestKeys.every((key) => allowedKeys.includes(key))
        if(!allowUpdateFlag)
        {
            return res.status(400).send({"error": "invalid keys found"})
        }
        try{
        const task = await Tasks.findOne({_id: req.params.id, owner: req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }
        
        requestKeys.forEach((update)=> task[update] = req.body[update])
        await task.save()
        
        res.send(task)
    }catch(error){
        res.status(500).json({ error: error.message })
    }
})

router.delete('/tasks/:id', auth, async(req,res)=>{
    try{
        const task = await Tasks.findOneAndDelete({"_id": req.params.id, "owner": req.user._id})
        if(!task)
        {
            return res.status(404).send("Task not found")
        }

        res.send(task)
    }catch(error)
    {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router