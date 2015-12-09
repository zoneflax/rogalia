 FILENAME == "-" && $2 == "Duplicate" {
         dup = 1
         next
 }

 FILENAME == "-" && dup == 1 {
         dup = 0
         match($0, "Line ([0-9]+)", line)
         lines[line[1]] = true
 }

 FILENAME != "-" {
         if (FNR in lines)
                 next
         print
 }
