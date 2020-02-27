import * as glob from "glob";
import * as fs from "fs";
import * as commandLineArgs from "command-line-args";
import * as commandLineUsage from "command-line-usage";

const mergeGraphqlSchemas = require("merge-graphql-schemas");
const fileLoader = mergeGraphqlSchemas.fileLoader;
const mergeTypes = mergeGraphqlSchemas.mergeTypes;

class GraphQLMerger {
    public getCliOptions(): {
        src: string,
        outDir: string,
    } {
        const optionDefinitions = [
            {
                name: 'src',
                alias: 's', type: String,
                description: "A glob pattern of the source files",
            },
            {
                name: 'outDir',
                alias: 'o',
                type: String,
                description: "The target file where to write the merged GraphQL schema output",
            }
        ];
        const argv = commandLineArgs(optionDefinitions);
        console.log(argv);

        if (!argv.src || !argv.src) {
            // Required parameter not provided
            const sections = [
                {
                    header: 'GraphQL schema merger',
                    content: 'Merge multiple GraphQL schema files using a glob pattern'
                },
                {
                    header: 'Options',
                    optionList: optionDefinitions
                }
            ];
            const usage = commandLineUsage(sections);
            console.log(usage);

            process.exit(0);
        }

        return argv;
    }

    merge() {
        const options = this.getCliOptions();

        console.log("Merging GraphQL schema definitions from multiple stacks");

        glob(options.src, {}, function (er, files) {
            if (er) {
                console.log("Error occurred while collecting GraphQL schema files to merge");
                throw er;
            }

            console.log("Found " + files.length + " schema files to merge", files);

            const typesArray: any[] = [];
            files.forEach(file => {
                typesArray.push(fileLoader(file).pop());
            });

            const mergedSchemaString = mergeTypes(typesArray, {all: true});

            console.log("Writing schema file to final destination");
            fs.writeFileSync(options.outDir, mergedSchemaString);
            console.log("Schemas merged successfully!");
        });
    }
}

const merger = new GraphQLMerger();
merger.merge();