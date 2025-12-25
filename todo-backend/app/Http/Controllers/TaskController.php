<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;

 class TaskController extends Controller
   {
       public function index()
       {
           return Task::all();
       }

       public function store(Request $request)
       {
           $request->validate([
               'title' => 'required|string|max:255',
               'description' => 'nullable|string',
           ]);

           return Task::create($request->all());
       }

       public function show(Task $task)
       {
           return $task;
       }

       public function update(Request $request, Task $task)
       {
           $request->validate([
               'title' => 'required|string|max:255',
               'description' => 'nullable|string',
               'completed' => 'boolean',
           ]);

           $task->update($request->all());
           return $task;
       }

       public function destroy(Task $task)
       {
           $task->delete();
           return response()->noContent();
       }
   }
   