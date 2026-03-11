Const ForReading = 1
Const ForWriting = 2

Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objFile = objFSO.OpenTextFile("tools\generate_exercises.py", ForReading)
strText = objFile.ReadAll
objFile.Close

lines = Split(strText, vbCrLf)
currentCategory = ""

Set dictCats = CreateObject("Scripting.Dictionary")
dictCats.Add "Pecho", "pecho"
dictCats.Add "Espalda", "espalda"
dictCats.Add "Hombros", "hombros"
dictCats.Add "Piernas - Cuádriceps", "piernas"
dictCats.Add "Piernas - Femorales, Glúteos y Cadera", "piernas"
dictCats.Add "Pantorrillas y Tibiales", "piernas"
dictCats.Add "Bíceps y Antebrazos", "brazos"
dictCats.Add "Tríceps", "brazos"
dictCats.Add "Antebrazos y Cuello", "brazos"
dictCats.Add "Core y Abdomen", "core"
dictCats.Add "Cuerpo Completo, Halterofilia, Pliometría y Cardio funcional", "cardio"

Function RemoveAccents(str)
    str = Replace(str, "á", "a")
    str = Replace(str, "é", "e")
    str = Replace(str, "í", "i")
    str = Replace(str, "ó", "o")
    str = Replace(str, "ú", "u")
    str = Replace(str, "Á", "a")
    str = Replace(str, "É", "e")
    str = Replace(str, "Í", "i")
    str = Replace(str, "Ó", "o")
    str = Replace(str, "Ú", "u")
    str = Replace(str, "ñ", "n")
    str = Replace(str, "Ñ", "n")
    RemoveAccents = LCase(str)
End Function

Function Idify(name)
    parts = Split(name, " -")
    rawName = Trim(parts(0))
    cleanName = RemoveAccents(rawName)
    
    Set regEx = New RegExp
    regEx.Global = True
    regEx.Pattern = "[^a-z0-9]+"
    idName = regEx.Replace(cleanName, "-")
    
    regEx.Pattern = "^-|-$"
    Idify = regEx.Replace(idName, "")
End Function

Dim exercisesArr(7) ' 0:pecho, 1:espalda, 2:piernas, 3:hombros, 4:brazos, 5:core, 6:cardio
For i = 0 To 6
    exercisesArr(i) = ""
Next

Function GetCatIndex(cat)
    Select Case cat
        Case "pecho" GetCatIndex = 0
        Case "espalda" GetCatIndex = 1
        Case "piernas" GetCatIndex = 2
        Case "hombros" GetCatIndex = 3
        Case "brazos" GetCatIndex = 4
        Case "core" GetCatIndex = 5
        Case "cardio" GetCatIndex = 6
    End Select
End Function

For Each line In lines
    line = Trim(line)
    If line <> "" Then
        If InStr(line, "(") > 0 And Right(line, 1) = ")" Then
            catHeader = Trim(Split(line, "(")(0))
            If dictCats.Exists(catHeader) Then
                currentCategory = dictCats(catHeader)
            End If
        ElseIf InStr(line, " - ") > 0 Then
            exName = Trim(Split(line, " - ")(0))
            exId = Idify(exName)
            
            If currentCategory <> "" Then
                sets = 3
                reps = "'10-12'"
                rest = 60
                If currentCategory = "cardio" Then
                    sets = 1
                    reps = "'20 min'"
                    rest = 0
                End If
                
                exStr = vbTab & vbTab & "{ id: '" & exId & "', name: '" & Replace(exName, "'", "\'") & "', sets: " & sets & ", reps: " & reps & ", rest: " & rest & ", instructions: '' }," & vbCrLf
                
                catIdx = GetCatIndex(currentCategory)
                exercisesArr(catIdx) = exercisesArr(catIdx) & exStr
            End If
        End If
    End If
Next

outputStr = "export const EXERCISE_LIBRARY = {" & vbCrLf
outputStr = outputStr & "  pecho:" & vbCrLf & "  {" & vbCrLf & "    label: 'Pecho', icon: '🫁', color: 'var(--pecho)'," & vbCrLf & "    exercises: [" & vbCrLf & exercisesArr(0) & vbTab & vbTab & "]" & vbCrLf & "  }," & vbCrLf
outputStr = outputStr & "  espalda:" & vbCrLf & "  {" & vbCrLf & "    label: 'Espalda', icon: '🔙', color: 'var(--espalda)'," & vbCrLf & "    exercises: [" & vbCrLf & exercisesArr(1) & vbTab & vbTab & "]" & vbCrLf & "  }," & vbCrLf
outputStr = outputStr & "  piernas:" & vbCrLf & "  {" & vbCrLf & "    label: 'Piernas', icon: '🦵', color: 'var(--piernas)'," & vbCrLf & "    exercises: [" & vbCrLf & exercisesArr(2) & vbTab & vbTab & "]" & vbCrLf & "  }," & vbCrLf
outputStr = outputStr & "  hombros:" & vbCrLf & "  {" & vbCrLf & "    label: 'Hombros', icon: '💪', color: 'var(--hombros)'," & vbCrLf & "    exercises: [" & vbCrLf & exercisesArr(3) & vbTab & vbTab & "]" & vbCrLf & "  }," & vbCrLf
outputStr = outputStr & "  brazos:" & vbCrLf & "  {" & vbCrLf & "    label: 'Brazos', icon: '🦾', color: 'var(--brazos)'," & vbCrLf & "    exercises: [" & vbCrLf & exercisesArr(4) & vbTab & vbTab & "]" & vbCrLf & "  }," & vbCrLf
outputStr = outputStr & "  core:" & vbCrLf & "  {" & vbCrLf & "    label: 'Core / Abdomen', icon: '🎯', color: 'var(--core)'," & vbCrLf & "    exercises: [" & vbCrLf & exercisesArr(5) & vbTab & vbTab & "]" & vbCrLf & "  }," & vbCrLf
outputStr = outputStr & "  cardio:" & vbCrLf & "  {" & vbCrLf & "    label: 'Cardio', icon: '🏃', color: 'var(--cardio)'," & vbCrLf & "    exercises: [" & vbCrLf & exercisesArr(6) & vbTab & vbTab & "]" & vbCrLf & "  }" & vbCrLf
outputStr = outputStr & "};" & vbCrLf

Set objOutFile = objFSO.CreateTextFile("tools\output_library.js", True, True) ' Unicode True
objOutFile.Write outputStr
objOutFile.Close

WScript.Echo "JSON generated"
