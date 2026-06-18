<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NutritionController extends Controller
{
    public function index()
    {
        return Inertia::render('Nutrition/Calculator');
    }
}
